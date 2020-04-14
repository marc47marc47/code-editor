(window.webpackJsonp=window.webpackJsonp||[]).push([[17],{544:function(r,e,n){"use strict";n.r(e),e.default={"index.html":'<!DOCTYPE html>\r\n<html lang="en">\r\n\r\n<head>\r\n  <meta charset="UTF-8">\r\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\r\n  <meta http-equiv="X-UA-Compatible" content="ie=edge">\r\n  <script src="https://unpkg.com/systemjs@0.21.6/dist/system.js"><\/script>\r\n  <title><%name%></title>\r\n</head>\r\n\r\n<body>\r\n  <noscript>\r\n    <strong>We\'re sorry but <%name%> doesn\'t work properly without JavaScript enabled.\r\n      Please enable it to continue.</strong>\r\n  </noscript>\r\n  <div id="app"><%name%> is loading...</div>\r\n  <script src="systemjs.config.js"><\/script>\r\n</body>\r\n\r\n</html>',"systemjs.config.js":"SystemJS.config({\r\n  baseURL:'https://unpkg.com/',\r\n  defaultExtension: true,\r\n  meta: {\r\n    '*.vue': {\r\n      'loader': 'vue-loader'\r\n    }\r\n  },\r\n  map: {\r\n    'plugin-babel': 'systemjs-plugin-babel@latest/plugin-babel.js',\r\n    'systemjs-babel-build': 'systemjs-plugin-babel@latest/systemjs-babel-browser.js',\r\n    'vue-loader': 'systemjs-vue-loader@latest',\r\n    'vue': 'vue@latest/dist/vue.js',\r\n    'vue-template-compiler': 'vue-template-compiler@latest'\r\n  },\r\n  transpiler: 'plugin-babel'\r\n});\r\n\r\nSystemJS.import('./src/main.js')\r\n  .catch(console.error.bind(console));","src/main.js":"import Vue from 'vue'\r\nimport App from './App.vue'\r\n\r\nnew Vue({\r\n  render: h => h(App)\r\n}).$mount('#app')","src/App.vue":'<template>\r\n  <div id="app">\r\n    <img alt="Vue logo" src="./assets/logo.svg" />\r\n    <HelloWorld msg="Welcome to Your Vue.js App" />\r\n  </div>\r\n</template>\r\n\r\n<script>\r\nimport HelloWorld from "./components/HelloWorld.vue";\r\n\r\nexport default {\r\n  name: "App",\r\n  components: {\r\n    HelloWorld\r\n  }\r\n};\r\n<\/script>\r\n\r\n<style>\r\n#app {\r\n  font-family: Avenir, Helvetica, Arial, sans-serif;\r\n  -webkit-font-smoothing: antialiased;\r\n  -moz-osx-font-smoothing: grayscale;\r\n  text-align: center;\r\n  color: #2c3e50;\r\n  margin-top: 60px;\r\n}\r\n\r\n#app img {\r\n  height: 200px;\r\n  width: 200px;\r\n}\r\n</style>\r\n',"src/components/HelloWorld.vue":'<template>\r\n  <div class="hello">\r\n    <h1>{{ msg }}</h1>\r\n    <h3>Essential Links</h3>\r\n    <ul>\r\n      <li><a href="https://vuejs.org" target="_blank" rel="noopener">Core Docs</a></li>\r\n      <li><a href="https://forum.vuejs.org" target="_blank" rel="noopener">Forum</a></li>\r\n      <li><a href="https://chat.vuejs.org" target="_blank" rel="noopener">Community Chat</a></li>\r\n      <li><a href="https://twitter.com/vuejs" target="_blank" rel="noopener">Twitter</a></li>\r\n      <li><a href="https://news.vuejs.org" target="_blank" rel="noopener">News</a></li>\r\n    </ul>\r\n    <h3>Ecosystem</h3>\r\n    <ul>\r\n      <li><a href="https://router.vuejs.org" target="_blank" rel="noopener">vue-router</a></li>\r\n      <li><a href="https://vuex.vuejs.org" target="_blank" rel="noopener">vuex</a></li>\r\n      <li><a href="https://github.com/vuejs/vue-devtools#vue-devtools" target="_blank" rel="noopener">vue-devtools</a></li>\r\n      <li><a href="https://vue-loader.vuejs.org" target="_blank" rel="noopener">vue-loader</a></li>\r\n      <li><a href="https://github.com/vuejs/awesome-vue" target="_blank" rel="noopener">awesome-vue</a></li>\r\n    </ul>\r\n  </div>\r\n</template>\r\n\r\n<script>\r\nexport default {\r\n  name: \'HelloWorld\',\r\n  props: {\r\n    msg: String\r\n  }\r\n}\r\n<\/script>\r\n\r\n\x3c!-- Add "scoped" attribute to limit CSS to this component only --\x3e\r\n<style scoped>\r\nh3 {\r\n  margin: 40px 0 0;\r\n}\r\nul {\r\n  list-style-type: none;\r\n  padding: 0;\r\n}\r\nli {\r\n  display: inline-block;\r\n  margin: 0 10px;\r\n}\r\na {\r\n  color: #42b983;\r\n}\r\n</style>',"assets/logo.svg":'<svg viewBox="0 0 256 221" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet"><path d="M204.8 0H256L128 220.8 0 0h97.92L128 51.2 157.44 0h47.36z" fill="#41B883"/><path d="M0 0l128 220.8L256 0h-51.2L128 132.48 50.56 0H0z" fill="#41B883"/><path d="M50.56 0L128 133.12 204.8 0h-47.36L128 51.2 97.92 0H50.56z" fill="#35495E"/></svg>'}}}]);