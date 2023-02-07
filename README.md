## Tunnel Service

```powershell
wireguard /installtunnelservice C:\wg.conf
wireguard /uninstalltunnelservice wg
```

## Manager Service

```powershell
> wireguard /installmanagerservice
> wireguard /uninstallmanagerservice
```

## Usage

```js
pm2 start wg.js --time
pm2 restart wg --time
```

## Config

Edit the config.js file
