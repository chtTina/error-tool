import html2canvas from 'html2canvas';
import $ from '../lib/query.js';

import './core.scss';
import tpl from './core.html';

import VFeedbackNetwork from '../network/network.js';



const VFEEDBACK_ID = '#__vfeedback';

class VFeedback {
  constructor(opt) {
    this.opt = opt
    if (!!$.one(VFEEDBACK_ID)) {
      console.debug('vFeedback is already exists.');
      return;
    }
    let that = this;
    this.$dom = null;
    this.image = ''
    this.network = {}

    this._network();

    // try to init
    let _onload = function() {
      that._render();
      that._bindEvent();
    };
    if (document !== undefined) {
      if (document.readyState === 'loading') {
        $.bind(window, 'DOMContentLoaded', _onload);
      } else {
        _onload();
      }
    } else {
      // if document does not exist, wait for it
      let _timer;
      let _pollingDocument = function() {
        if (!!document && document.readyState == 'complete') {
          _timer && clearTimeout(_timer);
          _onload();
        } else {
          _timer = setTimeout(_pollingDocument, 1);
        }
      };
      _timer = setTimeout(_pollingDocument, 1);
    }
    

  }

  _render() {
    if (! $.one(VFEEDBACK_ID)) {
      const e = document.createElement('div');
      e.innerHTML = tpl;
      document.documentElement.insertAdjacentElement('beforeend', e.children[0]);
    }
    this.$dom = $.one(VFEEDBACK_ID);

    // reposition feedback button
    const $switch = $.one('.fd-btn', this.$dom);

    // modify font-size
    const dpr = window.devicePixelRatio || 1;
    const viewportEl = document.querySelector('[name="viewport"]');
    if (viewportEl && viewportEl.content) {
      const initialScale = viewportEl.content.match(/initial\-scale\=\d+(\.\d+)?/);
      const scale = initialScale ? parseFloat(initialScale[0].split('=')[1]) : 1;
      if (scale < 1) {
        this.$dom.style.fontSize = 13 * dpr + 'px';
      }
    }
  }

  _network() {
    this.network = new VFeedbackNetwork()
  }

  /**
   * bind DOM events
   * @private
   */
  _bindEvent() {
    const that = this;
    // capture picture
    $.bind($.one('.fd-btn', that.$dom), 'click', function() {
      html2canvas(document.body).then(function(canvas) {
        that.image = canvas.toDataURL("image/png");
      });
    });
  };
}

VFeedback.VFeedbackNetwork = VFeedbackNetwork

export default VFeedback;