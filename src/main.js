import "./styles/index.scss";
import "./styles/page.scss";
import './styles/list.scss';
import './styles/sidenav.scss';
import './styles/tile.scss';
import './styles/contextMenu.scss';
import './styles/dialogs.scss';
import './styles/themes.scss';
import './styles/help.scss';
import './styles/overideAceStyle.scss';

import "core-js/stable";
import tag from 'html-tag-js';
import mustache from 'mustache';
import tile from "./components/tile";
import sidenav from './components/sidenav';
import contextMenu from './components/contextMenu';
import EditorManager from './modules/editorManager';
import fs from './modules/utils/androidFileSystem';
import ActionStack from "./modules/actionStack";
import helpers from "./modules/helpers";
import Settings from "./settings";
import dialogs from "./components/dialogs";
import constants from "./constants";
import HandleIntent from "./modules/handleIntent";
import createEditorFromURI from "./modules/createEditorFromURI";
import addFolder from "./modules/addFolder";
import quickToolAction from "./modules/events/quicktools";
import arrowkeys from "./modules/events/arrowkeys";
// import gitHub from "./modules/gitHub";

import $_menu from './views/menu.hbs';
import $_row1 from './views/footer/row1.hbs';
import $_row2 from './views/footer/row2.hbs';
import $_search from './views/footer/search.hbs';
import $_rating from './views/rating.hbs';
import saveFile from "./modules/saveFile";
import git from "./modules/git";
import runPreview from "./modules/runPreview";
import Admob from "./modules/admob";
import commands from "./modules/commands";
//@ts-check

window.onload = Main;

function Main() {
  let timeout;
  const oldPreventDefault = TouchEvent.prototype.preventDefault;
  TouchEvent.prototype.preventDefault = function () {
    if (this.cancelable) {
      oldPreventDefault.bind(this)();
    }
  };

  const language = navigator.language.toLowerCase();
  let lang = null;
  if (!localStorage.globalSettings && language in constants.langList) {
    lang = language;
  }

  window.app = document.body = tag(document.body);
  window.actionStack = ActionStack();
  window.editorCount = 0;
  window.alert = dialogs.alert;
  window.addedFolder = {};
  window.fileClipBoard = null;
  window.isLoading = true;
  window.restoreTheme = restoreTheme;
  window.getCloseMessage = () => {};
  window.beforeClose = null;
  window.saveInterval = null;
  window.editorManager = {
    files: [],
    activeFile: null
  };

  if (!('files' in localStorage)) {
    localStorage.setItem('files', '[]');
  }
  if (!('folders' in localStorage)) {
    localStorage.setItem('folders', '[]');
  }

  document.addEventListener("deviceready", () => {

    const permissions = cordova.plugins.permissions;
    const requiredPermissions = [
      permissions.WRITE_EXTERNAL_STORAGE,
      permissions.WRITE_MEDIA_STORAGE,
      permissions.MANAGE_DOCUMENTS
    ];

    requiredPermissions.map((permission, i) => {
      permissions.checkPermission(permission, (status) => success(status, i));
    });

    function success(status, i) {
      if (!status.hasPermission) {
        permissions.requestPermission(requiredPermissions[i], () => {});
      }
    }

    window.appSettings = new Settings(lang);
    if (appSettings.loaded) {
      ondeviceready();
    } else {
      appSettings.onload = ondeviceready;
    }
  });

  function ondeviceready() {
    const url = `${cordova.file.applicationDirectory}www/lang/${appSettings.value.lang}.json`;
    window.gitRecordURL = cordova.file.externalDataDirectory + 'git/.gitfiles';
    window.gistRecordURL = cordova.file.externalDataDirectory + 'git/.gistfiles';
    fs.readFile(url)
      .then(res => {
        const decoder = new TextDecoder('utf-8');
        const text = decoder.decode(res.data);
        window.strings = JSON.parse(text);
        initGit();
      })
      .catch(err => {
        console.log(err);
      });
  }

  function initGit() {

    timeout = setTimeout(initGit, 1000);

    git.init()
      .then(() => {
        if (timeout) clearTimeout(timeout);
        runApp();
      })
      .catch(err => {
        if (timeout) clearTimeout(timeout);
        console.log(err);
      });
  }
}

function runApp() {
  app.addEventListener('click', function (e) {
    const el = e.target;
    if (el instanceof HTMLAnchorElement) {
      e.preventDefault();
      e.stopPropagation();

      window.open(el.href, '_system');
    }
  });

  if (window.AdMob) Admob();
  else window.AdMob = null;

  const version = localStorage.getItem('version');
  if (version !== BuildInfo.version) {
    localStorage.clear();
    localStorage.setItem('version', BuildInfo.version);
  }

  const Acode = {
    exec: function (key, val) {
      if (key in commands) {
        commands[key](val);
        return true;
      } else {
        return false;
      }
    }
  };

  window.Acode = Acode;
  document.addEventListener('backbutton', backButton);
  window.beautify = ace.require("ace/ext/beautify").beautify;

  new App();

  function backButton() {
    if (window.freeze) return;
    actionStack.pop();
  }
}

function App() {
  //#region declaration
  const _search = mustache.render($_search, strings);
  const $toggler = tag('span', {
    className: 'icon menu'
  });
  const $menuToggler = tag("span", {
    className: 'icon more_vert'
  });
  const $header = tile({
    type: 'header',
    text: 'Acode',
    lead: $toggler,
    tail: $menuToggler
  });
  const $footer = tag('footer', {
    innerHTML: mustache.render($_row1, strings),
    tabIndex: -1
  });
  const $mainMenu = contextMenu(mustache.render($_menu, strings), {
    top: '6px',
    right: '6px',
    toggle: $menuToggler,
    transformOrigin: 'top right'
  });
  const $main = tag('main');
  const $sidebar = sidenav($main, $toggler);
  const $runBtn = tag('span', {
    className: 'icon play_arrow',
    onclick: function () {
      let target = appSettings.value.previewMode;
      let console = false;
      if (helpers.getExt(editorManager.activeFile.filename) === 'js') {
        console = true;
        target = 'in app';
      }
      if (target === 'none') {
        dialogs.select(strings['preview mode'], ['browser', 'in app'])
          .then(res => {
            runPreview(console, res);
          });
      } else {
        runPreview(console, target);
      }
    },
    style: {
      fontSize: '1.2em'
    }
  });
  const $edit = tag('span', {
    className: 'icon edit',
    onclick: function () {
      const file = editorManager.activeFile;
      file.editable = !file.editable;
      if (file.editable) this.classList.remove('dull');
      else this.classList.add('dull');
      editorManager.onupdate();
    },
    attr: {
      style: 'font-size: 1.2em !important;'
    }
  });
  const fileOptions = {
    save: $mainMenu.querySelector('[action=save]'),
    saveAs: $mainMenu.querySelector('[action="save-as"]'),
    goto: $mainMenu.querySelector('[action=goto]')
  };

  $sidebar.setAttribute('empty-msg', strings['open folder']);
  window.editorManager = EditorManager($sidebar, $header, $main);
  const editor = editorManager.editor;
  //#endregion

  //#region initialization
  window.restoreTheme();
  $main.setAttribute("data-empty-msg", strings['no editor message']);

  let count = parseInt(localStorage.count) || 0;
  if (count === 3) {

    const html = $_rating;
    dialogs.box('Did you like the app?', html, onInteract);

  } else if (count < 3) {
    localStorage.count = ++count;
  }
  //#endregion

  //#region rendering
  $header.classList.add('light');
  root.append($header, $main);
  //#endregion

  $mainMenu.addEventListener('click', handleMenu);
  $footer.addEventListener('click', handleFooter);
  $footer.addEventListener('touchstart', footerTouchStart);
  $footer.addEventListener('contextmenu', footerOnContextMenu);
  window.beforeClose = saveState;

  setTimeout(() => {
    loadFiles()
      .then(loadFolders)
      .then(() => {
        setTimeout(() => {
          app.classList.remove('loading', 'splash');
          window.isLoading = false;
        }, 500);
        //#region event listeners 
        if (cordova.platformId === 'android') {
          window.plugins.intent.setNewIntentHandler(HandleIntent);
          window.plugins.intent.getCordovaIntent(HandleIntent, function (e) {
            console.log("Error: Cannot handle open with file intent", e);
          });
          document.addEventListener('menubutton', $sidebar.toggle);
          navigator.app.overrideButton("menubutton", true);
        }

        document.addEventListener('pause', window.beforeClose);
        document.addEventListener('resume', checkFiles);
        checkFiles();

        const autosave = parseInt(appSettings.value.autosave);
        if (autosave) {
          saveInterval = setInterval(() => {
            editorManager.files.map(file => {
              if (file.isUnsaved && file.location) saveFile(file, undefined, false);
              return file;
            });
          }, autosave);
        }
      });
  }, 100);

  editorManager.onupdate = function () {
    /**
     * @type {File}
     */
    const activeFile = this.activeFile;
    const $save = $footer.querySelector('[action=save]');

    if (!$footer.parentElement && activeFile) {
      root.classList.add('bottom-bar');
      root.append($footer);
    }

    if (!$edit.isConnected) {
      $header.insertBefore($edit, $header.lastChild);
    }

    if (!activeFile) {
      fileOptions.save.classList.add('disabled');
      fileOptions.saveAs.classList.add('disabled');
      fileOptions.goto.classList.add('disabled');
      root.classList.remove('bottom-bar');
      $footer.remove();
      $runBtn.remove();
    } else if (activeFile) {
      fileOptions.saveAs.classList.remove('disabled');
      fileOptions.goto.classList.remove('disabled');

      if (!activeFile.readOnly) {
        fileOptions.save.classList.remove('disabled');
        $save.classList.remove('disabled');
      } else {
        fileOptions.save.classList.add('disabled');
        $save.classList.add('disabled');
      }

      if (activeFile.isUnsaved) {
        activeFile.assocTile.classList.add('notice');
        $save.classList.add('notice');
      } else {
        activeFile.assocTile.classList.remove('notice');
        $save.classList.remove('notice');
      }

      this.editor.setReadOnly(!activeFile.editable);
      if (activeFile.editable) $edit.classList.remove('dull');
      else $edit.classList.add('dull');

      if (['html', 'htm', 'xhtml', 'md', 'js', 'php'].includes(helpers.getExt(activeFile.filename))) {
        $header.insertBefore($runBtn, $header.lastChild);
      } else {
        $runBtn.remove();
      }
    }

    saveState();
  };

  window.getCloseMessage = function () {
    const numFiles = editorManager.hasUnsavedFiles();
    if (numFiles) {
      return strings["unsaved files close app"];
    }
  };

  $sidebar.onshow = function () {
    const activeFile = editorManager.activeFile;
    if (activeFile) editor.blur();
  };

  function onInteract(e) {
    /**
     * @type {HTMLSpanElement}
     */
    const $el = e.target;
    if (!$el) return;
    let val = $el.getAttribute('value');
    if (val) val = parseInt(val);
    const siblings = $el.parentElement.children;
    const len = siblings.length;
    for (let i = 0; i < len; ++i) {
      const star = siblings[i];
      star.classList.remove('stargrade', 'star_outline');
      if (i < val) star.classList.add('stargrade');
      else star.classList.add('star_outline');
    }

    setTimeout(() => {
      if (val === 5) window.open(`https://play.google.com/store/apps/details?id=${BuildInfo.packageName}`, '_system');
      else window.open(`mailto:dellevenjack@gmail.com?subject=feedback - Acode code editor for android&body=version-${BuildInfo.version}`, '_system');
    }, 100);

    localStorage.count = 4;
  }

  function saveState() {
    if (!editorManager || isLoading) return;

    const lsEditor = [];
    const allFolders = Object.keys(addedFolder);
    const folders = [];
    const activeFile = editorManager.activeFile;
    const unsaved = [];

    for (let file of editorManager.files) {
      const edit = {};
      edit.name = file.filename;
      edit.type = file.type;
      if (edit.type === 'git') edit.sha = file.record.sha;
      else if (edit.type === 'gist') {
        edit.id = file.record.id;
        edit.isNew = file.record.isNew;
      }
      if (file.fileUri) {
        edit.fileUri = file.fileUri;
        edit.readOnly = file.readOnly ? 'true' : '';
        unsaved.push({
          id: btoa(file.id),
          fileUri: file.fileUri
        });
      } else if (file.contentUri) {
        edit.contentUri = file.contentUri;
        edit.readOnly = true;
      }
      if (file.isUnsaved) {
        edit.data = file.session.getValue();
      }
      edit.cursorPos = editorManager.editor.getCursorPosition();
      lsEditor.push(edit);
    }

    unsaved.map(file => {
      window.resolveLocalFileSystemURL(file.fileUri, fs => {
        const extDir = cordova.file.externalCacheDirectory;
        window.resolveLocalFileSystemURL(extDir, parent => {
          fs.copyTo(parent, file.id);
        }, err => {
          console.error(err);
        });
      }, err => {
        console.error(err);
      });
      return file;
    });

    allFolders.map(folder => {
      folders.push({
        url: folder,
        name: addedFolder[folder].name
      });
      return folder;
    });

    if (activeFile) {
      localStorage.setItem('lastfile', activeFile.fileUri || activeFile.contentUri || activeFile.filename);
    }

    localStorage.setItem('files', JSON.stringify(lsEditor));
    localStorage.setItem('folders', JSON.stringify(folders));
  }

  function loadFiles() {
    return new Promise((resolve) => {
      if ('files' in localStorage && localStorage.files !== '[]') {
        /**
         * @type {storedFiles[]}
         */
        const files = JSON.parse(localStorage.getItem('files'));
        const lastfile = localStorage.getItem('lastfile') || files.slice(-1)[0].url;
        files.map((file, i) => {

          const xtra = {
            text: file.data,
            cursorPos: file.cursorPos,
            saved: false,
            render: false,
            readOnly: !!file.readOnly,
            index: i
          };

          if (file.type === 'git') {
            gitRecord.get(file.sha)
              .then(record => {
                if (record) {
                  editorManager.addNewFile(file.name, {
                    type: 'git',
                    text: file.data || record.data,
                    isUnsaved: file.data ? true : false,
                    record
                  });
                }
                if (i === files.length - 1) resolve();
              });
          } else if (file.type === 'gist') {
            const gist = gistRecord.get(file.id, file.isNew);
            if (gist) {
              const gistFile = gist.files[file.name];
              editorManager.addNewFile(file.name, {
                type: 'gist',
                text: file.data || gistFile.content,
                isUnsaved: file.data ? true : false,
                record: gist
              });
            }
            if (i === files.length - 1) resolve();
          } else if (file.fileUri) {

            if (file.fileUri === lastfile) {
              xtra.render = true;
            }
            if (file.data) {
              xtra.saved = false;
            } else {
              xtra.saved = true;
            }

            createEditorFromURI(file.fileUri, false, xtra).then(index => {
              if (index === files.length - 1) resolve();
            });
          } else if (file.contentUri) {

            if (file.contentUri === lastfile) {
              xtra.render = true;
            }

            createEditorFromURI({
              name: file.name,
              dir: file.contentUri,
            }, true, xtra).then(index => {
              if (index === files.length - 1) resolve();
            });

          } else {
            const render = file.name === lastfile;
            const newFile = editorManager.addNewFile(file.name, {
              render,
              isUnsaved: !!file.data
            });
            if (file.data) {
              newFile.session.insert(file.cursorPos, file.data);
              newFile.session.setUndoManager(new ace.UndoManager());
            }

            if (i === files.length - 1) resolve();
          }
          return file;
        });
      } else {
        editorManager.addNewFile('untitled', {
          isUnsaved: false,
          render: true
        });
        resolve();
      }
    });
  }

  function loadFolders() {
    return new Promise(resolve => {
      if ('folders' in localStorage && localStorage.folders !== '[]') {
        const folders = JSON.parse(localStorage.getItem('folders'));
        folders.map((folder, i) => {
          addFolder(folder, $sidebar, i).then(index => {
            if (index === folders.length - 1) resolve();
          });
          return folder;
        });
      } else {
        resolve();
      }
    });
  }

  function checkFiles(e) {
    if (e) {
      for (let key in addedFolder) {
        addedFolder[key].reload();
      }
    }
    const files = editorManager.files;

    const dir = cordova.file.externalCacheDirectory;
    files.map(file => {
      if (file.type === 'git') return;
      if (file.fileUri) {
        const id = btoa(file.id);
        window.resolveLocalFileSystemURL(dir + id, entry => {
          fs.readFile(dir + id).then(res => {
            const data = res.data;
            const decoder = new TextDecoder("utf-8");
            const originalText = decoder.decode(data);

            fs.deleteFile(dir + id)
              .catch(err => {
                console.log(err);
              });

            window.resolveLocalFileSystemURL(file.fileUri, () => {
              fs.readFile(file.fileUri).then(res => {
                const data = res.data;
                // const decoder = new TextDecoder("utf-8");
                const text = decoder.decode(data);

                if (text !== originalText) {
                  if (!file.isUnsaved) {
                    update(file, text);
                  } else {
                    dialogs.confirm(strings.warning.toUpperCase(), file.filename + strings['file changed'])
                      .then(() => {
                        update(file, text);
                        editorManager.onupdate.call({
                          activeFile: editorManager.activeFile
                        });
                      });
                  }
                }
              }).catch(err => {
                console.error(err);
              });
            }, err => {
              if (err.code === 1) {
                editorManager.removeFile(file);
              }
            });
          });
        }, err => {});
      }
      return file;
    });

    if (!editorManager.activeFile) {
      app.focus();
    }

    /**
     * 
     * @param {File} file 
     * @param {string} text 
     */
    function update(file, text) {
      const cursorPos = editorManager.editor.getCursorPosition();
      file.session.setValue(text);
      file.isUnsaved = false;
      editorManager.editor.gotoLine(cursorPos.row, cursorPos.column);
      editorManager.editor.renderer.scrollCursorIntoView(cursorPos, 0.5);
      file.assocTile.classList.remove('notice');
    }
  }
  //#endregion

  /**
   * 
   * @param {MouseEvent} e 
   */
  function handleMenu(e) {
    const $target = e.target;
    const action = $target.getAttribute('action');
    const value = $target.getAttribute('value');
    if (!action) return;

    $mainMenu.hide();
    Acode.exec(action, value);
  }

  /**
   * 
   * @param {MouseEvent} e 
   */
  function handleFooter(e) {
    quickToolAction(e, $footer, $_row1, $_row2, _search);
  }

  function footerTouchStart(e) {
    arrowkeys.onTouchStart(e, $footer);
  }

  /**
   * 
   * @param {MouseEvent} e 
   */
  function footerOnContextMenu(e) {
    e.preventDefault();
    editor.focus();
  }

}

//#region global funtions

function restoreTheme(darken) {
  if (appSettings.value.appTheme === 'default') {
    const hexColor = darken ? '#5c5c99' : '#9999ff';
    app.classList.remove('theme-light');
    app.classList.remove('theme-dark');
    app.classList.add('theme-default');
    NavigationBar.backgroundColorByHexString(hexColor, false);
    StatusBar.backgroundColorByHexString(hexColor);
    StatusBar.styleLightContent();
  } else if (appSettings.value.appTheme === 'light') {
    const hexColor = darken ? '#999999' : '#ffffff';
    app.classList.remove('theme-default');
    app.classList.remove('theme-dark');
    app.classList.add('theme-light');
    NavigationBar.backgroundColorByHexString(hexColor, !!darken);
    StatusBar.backgroundColorByHexString(hexColor);
    StatusBar.styleDefault();
  } else {
    const hexColor = darken ? '#1d1d1d' : '#313131';
    app.classList.remove('theme-default');
    app.classList.remove('theme-light');
    app.classList.add('theme-dark');
    NavigationBar.backgroundColorByHexString(hexColor, true);
    StatusBar.backgroundColorByHexString(hexColor);
    StatusBar.styleLightContent();
  }
}
//#endregion