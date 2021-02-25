/*
 * @Descripttion: 
 * @version: 
 * @Author: tina.cai
 * @Date: 2021-02-22 16:35:50
 * @LastEditors: tina.cai
 * @LastEditTime: 2021-02-23 11:46:04
 */

const $ = {};

/**
 * get single element
 * @public
 */
$.one = function(selector, contextElement) {
  try {
    return (contextElement || document).querySelector(selector) || undefined;
  } catch (e) {
    return undefined;
  }
}

/**
 * bind an event to element(s)
 * @public
 * @param  array    $el      element object or array
 * @param  string    eventType  name of the event
 * @param  function  fn
 * @param  boolean    useCapture
 */
$.bind = function($el, eventType, fn, useCapture) {
  if (!$el) {
    return;
  }
  if (!(Object.prototype.toString.call($el) == '[object Array]')) {
    $el = [$el];
  }
  $el.forEach((el) => {
    el.addEventListener(eventType, fn, !!useCapture);
  })
}

/**
 * get multiple elements
 * @public
 */
$.all = function(selector, contextElement) {
  try {
    const nodeList = (contextElement || document).querySelectorAll(selector);
    return [].slice.call(nodeList);
  } catch (e) {
    return [];
  }
}


/**
 * see whether an element contains a className
 * @public
 */
$.hasClass = function($el, className) {
  if (!$el || !$el.classList) {
    return false;
  }
  return $el.classList.contains(className);
}


/**
 * delegate an event to a parent element
 * @public
 * @param  array     $el        parent element
 * @param  string    eventType  name of the event
 * @param  string    selector   target's selector
 * @param  function  fn
 */
$.delegate = function($el, eventType, selector, fn) {
  if (!$el) { return; }
  $el.addEventListener(eventType, function(e) {
    let targets = $.all(selector, $el);
    if (!targets) {
      return;
    }
    findTarget:
    for (let i=0; i<targets.length; i++) {
      let $node = e.target;
      while ($node) {
        if ($node == targets[i]) {
          fn.call($node, e);
          break findTarget;
        }
        $node = $node.parentNode;
        if ($node == $el) {
          break;
        }
      }
    }
  }, false);
};


/**
 * export
 */
export default $;