/*
 * @Descripttion: 
 * @version: 
 * @Author: tina.cai
 * @Date: 2021-02-24 17:19:56
 * @LastEditors: tina.cai
 * @LastEditTime: 2021-02-24 17:24:43
 */
/**
 * tools Functions
 */
/**
 * determines whether the passed value is a specific type
 * @param mixed value
 * @return boolean
 */
export function isString(value) {
  return Object.prototype.toString.call(value) == '[object String]';
}

/**
 * check whether an object is plain (using {})
 * @param object obj
 * @return boolean
 */
export function isPlainObject(obj) {
  let hasOwn = Object.prototype.hasOwnProperty;
  // Must be an Object.
  if (!obj || typeof obj !== 'object' || obj.nodeType || isWindow(obj)) {
    return false;
  }
  try {
    if (obj.constructor && !hasOwn.call(obj, 'constructor') && !hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
      return false;
    }
  } catch (e) {
    return false;
  }
  let key;
  for (key in obj) {}
  return key === undefined || hasOwn.call(obj, key);
}

export function isWindow(value) {
  var toString = Object.prototype.toString.call(value);
  return toString == '[object global]' || toString == '[object Window]' || toString == '[object DOMWindow]';
}
