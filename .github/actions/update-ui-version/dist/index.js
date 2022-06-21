/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 191:
/***/ ((__unused_webpack_module, __webpack_exports__, __nccwpck_require__) => {

// ESM COMPAT FLAG
__nccwpck_require__.r(__webpack_exports__);

;// CONCATENATED MODULE: ../../../plugin-hrm-form/package-lock.json
const package_lock_namespaceObject = JSON.parse('{"HO":{"bq1":{"i8":"1.30.2"}}}');
;// CONCATENATED MODULE: ./index.js
/**
 * If changes are made to this file, it needs to be recompiled using @vercel/ncc (https://github.com/vercel/ncc).
 * 1) Install vercel/ncc by running this command in your terminal. npm i -g @vercel/ncc
 * 2) Compile your index.js file. ncc build index.js --license licenses.txt
 * For details see https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action#commit-tag-and-push-your-action-to-github 
 */ 

// import { setOutput, setFailed } from '@actions/core';


const uiVersion = package_lock_namespaceObject.HO.bq1.i8;
if (uiVersion) {
  console.log(`flex ui version: ${JSON.stringify(uiVersion)}`);
  // setOutput(`flex ui version: ${uiVersion}`, true);
} else {
  console.log('Flex ui version not found');
  // setFailed('Flex ui version not found');
}
 

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The require scope
/******/ 	var __nccwpck_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__nccwpck_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module doesn't tell about it's top-level declarations so it can't be inlined
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__[191](0, __webpack_exports__, __nccwpck_require__);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;