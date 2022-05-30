echo brand-rc
echo -

json -I -f package.json -e this.name=\"ReadCloud\"
json -I -f package.json -e this.brand=\"rc\"
json -I -f package.json -e this.config.forge.packagerConfig.protocols[0].protocol=\"readcloud\"
json -I -f package.json -e this.config.forge.packagerConfig.protocols[0].name=\"readcloud\"
json -I -f package.json -e this.config.forge.packagerConfig.protocols[0].schemes=\"readcloud\"
json -I -f package.json -e this.config.forge.packagerConfig.icon=\"src/resources/app_icons/rc\"
json -I -f package.json -e this.config.forge.makers[0].config.name=\"ReadCloud\"

echo brand-rc-finish
