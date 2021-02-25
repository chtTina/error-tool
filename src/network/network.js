/*
 * @Descripttion: 
 * @version: 
 * @Author: tina.cai
 * @Date: 2021-02-23 16:21:29
 * @LastEditors: tina.cai
 * @LastEditTime: 2021-02-25 15:36:29
 */

import * as tool from '../lib/tool.js';

class VFeedbackNetwork {
  constructor() {
    this.reqList = {}; // URL as key, request item as value

    this.mockAjax();
    this.mockFetch();
  }

    /**
   * mock ajax request
   * @private
   */

  mockAjax() {
    let _XMLHttpRequest = window.XMLHttpRequest;
    if (!_XMLHttpRequest) { return; }

    const that = this;
    const _open = window.XMLHttpRequest.prototype.open,
          _send = window.XMLHttpRequest.prototype.send,
          _setRequestHeader = window.XMLHttpRequest.prototype.setRequestHeader;
    that._open = _open;
    that._send = _send;
    that._setRequestHeader = _setRequestHeader;

    // mock open()
    window.XMLHttpRequest.prototype.open = function() {
      let XMLReq = this;
      let args = [].slice.call(arguments),
          method = args[0],
          url = args[1],
          id = that.getUniqueID();
      let timer = null;

      // may be used by other functions
      XMLReq._requestID = id;
      XMLReq._method = method;
      XMLReq._url = url;

      // mock onreadystatechange
      let _onreadystatechange = XMLReq.onreadystatechange || function() {};
      let onreadystatechange = function() {

        let item = that.reqList[id] || {};

        // update status
        item.readyState = XMLReq.readyState;
        item.status = 0;
        if (XMLReq.readyState > 1) {
          item.status = XMLReq.status;
        }
        item.responseType = XMLReq.responseType;

        if (XMLReq.readyState == 0) {
          // UNSENT
          if (!item.startTime) {
            item.startTime = (+new Date());
          }
        } else if (XMLReq.readyState == 1) {
          // OPENED
          if (!item.startTime) {
            item.startTime = (+new Date());
          }
        } else if (XMLReq.readyState == 2) {
          // HEADERS_RECEIVED
          item.header = {};
          let header = XMLReq.getAllResponseHeaders() || '',
              headerArr = header.split("\n");
          // extract plain text to key-value format
          for (let i=0; i<headerArr.length; i++) {
            let line = headerArr[i];
            if (!line) { continue; }
            let arr = line.split(': ');
            let key = arr[0],
                value = arr.slice(1).join(': ');
            item.header[key] = value;
          }
        } else if (XMLReq.readyState == 3) {
          // LOADING
        } else if (XMLReq.readyState == 4) {
          // DONE
          clearInterval(timer);
          item.endTime = +new Date(),
          item.costTime = item.endTime - (item.startTime || item.endTime);
          item.response = XMLReq.response;
        } else {
          clearInterval(timer);
        }

        that.updateRequest(id, item);

        return _onreadystatechange.apply(XMLReq, arguments);
      };
      XMLReq.onreadystatechange = onreadystatechange;

      // some 3rd libraries will change XHR's default function
      // so we use a timer to avoid lost tracking of readyState
      let preState = -1;
      timer = setInterval(function() {
        if (preState != XMLReq.readyState) {
          preState = XMLReq.readyState;
          onreadystatechange.call(XMLReq);
        }
      }, 10);

      return _open.apply(XMLReq, args);
    };

    // mock setRequestHeader()
    window.XMLHttpRequest.prototype.setRequestHeader = function() {
      const XMLReq = this;
      const args = [].slice.call(arguments);

      const item = that.reqList[XMLReq._requestID];
      if (item) {
        if (!item.requestHeader) { item.requestHeader = {}; }
        item.requestHeader[args[0]] = args[1];
      }
      return _setRequestHeader.apply(XMLReq, args);
    };

    // mock send()
    window.XMLHttpRequest.prototype.send = function() {
      let XMLReq = this;
      let args = [].slice.call(arguments),
          data = args[0];

      let item = that.reqList[XMLReq._requestID] || {};
      item.method = XMLReq._method ? XMLReq._method.toUpperCase() : 'GET';

      let query = XMLReq._url ? XMLReq._url.split('?') : []; // a.php?b=c&d=?e => ['a.php', 'b=c&d=', 'e']
      item.url = XMLReq._url || '';
      item.name = query.shift() || ''; // => ['b=c&d=', 'e']
      item.name = item.name.replace(new RegExp('[/]*$'), '').split('/').pop() || '';

      if (query.length > 0) {
        item.name += '?' + query;
        item.getData = {};
        query = query.join('?'); // => 'b=c&d=?e'
        query = query.split('&'); // => ['b=c', 'd=?e']
        for (let q of query) {
          q = q.split('=');
          item.getData[ q[0] ] = decodeURIComponent(q[1]);
        }
      }

      if (item.method == 'POST') {

        // save POST data
        if (Object.prototype.toString.call(data) == '[object String]') {
          let arr = data.split('&');
          item.postData = {};
          for (let q of arr) {
            q = q.split('=');
            item.postData[ q[0] ] = q[1];
          }
        } else if (tool.isPlainObject(data)) {
          item.postData = data;
        } else {
          item.postData = '[object Object]';
        }

      }
      
      that.updateRequest(XMLReq._requestID, item);

      return _send.apply(XMLReq, args);
    };

  };

  /**
   * mock fetch request
   * @private
   */
  mockFetch() {
    const _fetch = window.fetch;
    if (!_fetch) { return; }
    const that = this;

    const prevFetch = (input, init) => {
      let id = that.getUniqueID();
      that.reqList[id] = {};
      let item = that.reqList[id] || {};
      let query = [],
          url = '',
          method = 'GET',
          requestHeader = null;
      
      // handle `input` content
      // if (tool.isString(input)) { // when `input` is a string
      //   method = init?.method || 'GET';
      //   url = input;
      //   requestHeader = init?.headers || null;
      // } else { // when `input` is a `Request` object
      //   method = input.method || 'GET';
      //   url = input.url;
      //   requestHeader = input.headers;
      // }
      // query = url.split('?');

      // item.id = id;
      // item.method = method;
      // item.requestHeader = requestHeader;
      // item.url = url;
      // item.name = query.shift() || '';
      // item.name = item.name.replace(new RegExp('[/]*$'), '').split('/').pop() || '';

      // if (item.method === 'POST') { // save POST data
      //   if (tool.isString(input)) { // when `input` is a string
      //     if (tool.isString(init?.body)) {
      //       let arr = init.body.split('&');
      //       item.postData = {};
      //       for (let q of arr) {
      //         q = q.split('=');
      //         item.postData[ q[0] ] = q[1];
      //       }
      //     } else if (tool.isPlainObject(init?.body)) {
      //       item.postData = init?.body;
      //     } else {
      //       item.postData = '[object Object]';
      //     }
      //   } else { // when `input` is a `Request` object
      //     // cannot get real type of request's body, so just display "[object Object]"
      //     item.postData = '[object Object]';
      //   }
      // }

      // UNSENT
      if (!item.startTime) {
        item.startTime = (+new Date());
      }
      return _fetch(url, init).then((response) => {
        response.clone().json().then((json) => {
          item.endTime = +new Date(),
          item.costTime = item.endTime - (item.startTime || item.endTime);
          item.status = response.status;
          item.header = {};
          for (let pair of response.headers.entries()) {
            item.header[pair[0]] = pair[1];
          }
          item.response = json;
          item.readyState = 4;
          const contentType = response.headers.get('content-type');
          item.responseType  = contentType.includes('application/json') ? 'json' : contentType.includes('text/html') ? 'text' : '';
          return json;
        })
        that.updateRequest(id, item);
        return response;
      })
    }
    window.fetch = prevFetch;
  }


  /**
   * add or update a request item by request ID
   * @private
   * @param string id
   * @param object data
   */
  updateRequest(id, data) {
    // see whether add new item into list
    // let preCount = Object.keys(this.reqList).length;

    // update item
    let item = this.reqList[id] || {};
    for (let key in data) {
      item[key] = data[key];
    }
    this.reqList[id] = item;
    // console.log(item);
  }

  /**
   * generate an unique id string (32)
   * @private
   * @return string
   */
  getUniqueID() {
    let id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
    return id;
  }

}

export default VFeedbackNetwork;