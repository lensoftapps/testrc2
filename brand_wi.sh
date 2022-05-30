echo brand-rc
echo -

json -I -f package.json -e this.name=\"Winc_eBooks\"
json -I -f package.json -e this.brand=\"wi\"
json -I -f package.json -e this.config.forge.packagerConfig.protocols[0].protocol=\"omxebooks\"
json -I -f package.json -e this.config.forge.packagerConfig.protocols[0].name=\"omxebooks\"
json -I -f package.json -e this.config.forge.packagerConfig.protocols[0].schemes=\"omxebooks\"
json -I -f package.json -e this.config.forge.packagerConfig.icon=\"src/resources/app_icons/winc\"
json -I -f package.json -e this.config.forge.makers[0].config.name=\"Winc_eBooks\"
replace-in-files package.json --string='Winc_eBooks' --replacement="Winc eBooks"

echo brand-rc-finish
