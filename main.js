const { app, BrowserWindow, webFrameMain, Menu, webFrame } = require('electron');
const { webContents } = require('electron');
const remote = require('electron').remote;
const { MenuItem } = require('electron/main');

let win;

const createWindow = () => {
  win = new BrowserWindow({
    width: 1000,
    height: 900
  })

  win.loadURL('https://treinamento3.sei.df.gov.br/sip/login.php?sigla_orgao_sistema=GDF&sigla_sistema=SEI')
  let login = `
        document.getElementById('txtUsuario').value = "adasa1";
        document.getElementById('pwdSenha').value = "adasa1";
        document.getElementById('selOrgao').value = 41
    `
  win.webContents.executeJavaScript(login)
  win.openDevTools();
  // captura o menu da página
  const menu = Menu.getApplicationMenu();
  // acrescentar um menu
  let _menuItem = null;
  let _bw = null

  win.webContents.on('did-frame-finish-load', async (event, url, frameId) => {
    // captura as janelas abertas
    const allWindows = BrowserWindow.getAllWindows();

    for (const [i, bw] of allWindows.entries()) {

      /**
       * Verifica se o iframe é editável, neste tipo há um id com o valor (#ifrEditorSalvar).
       */
      let isEditable = await bw.webContents.executeJavaScript(`document.querySelector('#ifrEditorSalvar') !== null`)
        .then((result) => {
          return result
        }).then(result => {
          // verifica se a tela tem o id ifrEditorSalvar
          if (result) {

            // verifica se o menu já foi preenchido
            if (_menuItem === null) {
              _bw = bw;
              /**
              * Função que preenche iframe com o texto indicado.
              */
              async function preencher() {
                try {
                  await _bw.
                    webContents.
                    executeJavaScript(`
                        if(typeof _frames === 'undefined') {
                          let _frames = document.getElementsByTagName('iframe');
                            if (_frames.length===5) {
                              _frames[2].contentDocument.body.innerHTML = 'texto indicado'
                            }
                          } 
                        `)
                } catch (err) {
                  console.log(err)
                }

              }
              const template = {
                label: 'Script',
                submenu: [
                  {
                    label: "inserir", click: () => {
                      preencher()



                      
                    }
                  }
                ]
              }
              _menuItem = new MenuItem(template)
              menu.append(_menuItem)

            }
          }
        })
      /**
       * Verifica se o menu já foi criado. Assim, mesmo com muitas renderizações da página, um menu apenas será acrescentado.
       * 
       */


      /*
    const frameElement = await
      bw.
        webContents.
        executeJavaScript(`
        if(typeof _frames === 'undefined') {
          let _frames = document.getElementsByTagName('iframe');
            if (_frames.length===5) {
              _frames[2].contentDocument.body.innerHTML = 'content editable'
            }
          } 
        `)*/

    }

  })

}

app.whenReady().then(() => {
  createWindow()

})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})