// Render the repository screens through React Native Web with synthetic data.
const path = require('path');
const fs = require('fs');
const tooling = process.env.README_TOOLS_DIR;
if (!tooling) throw Error('Set README_TOOLS_DIR to the directory containing esbuild and playwright.');
const esbuild = require(path.join(tooling, 'esbuild'));
const root = process.cwd();
const out = '/tmp/abacus-readme-ui';
fs.mkdirSync(out, { recursive: true });
const mocks = {
  '@react-native-community/datetimepicker': `export default function DateTimePicker(){return null};export const DateTimePickerAndroid={open(){},dismiss(){}};`,
  'expo-localization': `export const getLocales=()=>[{languageCode:'es',languageTag:'es-ES'}];`,
  'expo-haptics': `export const impactAsync=async()=>{},notificationAsync=async()=>{},ImpactFeedbackStyle={Light:1,Heavy:2},NotificationFeedbackType={Warning:1};`,
  'expo-linking': `export const openURL=()=>{},createURL=()=>'',addEventListener=()=>({remove(){}}),getInitialURL=async()=>null;`,
  'expo-application': `export const nativeApplicationVersion='0.25.0',nativeBuildVersion='53';`,
  'expo-local-authentication': `export const authenticateAsync=async()=>({success:true});`,
  'expo-store-review': `export const isAvailableAsync=async()=>false,requestReview=async()=>{};`,
  'expo-secure-store': `export const getItemAsync=async()=>null,setItemAsync=async()=>{},deleteItemAsync=async()=>{};`,
  'expo-auth-session': `export const makeRedirectUri=()=>'',useAuthRequest=()=>[null,null,()=>{}],exchangeCodeAsync=async()=>{},refreshAsync=async()=>{};`,
  'expo-quick-actions/hooks': `export const useQuickActionCallback=()=>{};`,
  'expo-blur': `export {View as BlurView} from 'react-native';`,
};
// Use the real glyph maps and fonts, avoiding native font-loading infrastructure.
const families = ['AntDesign','Ionicons','MaterialCommunityIcons','MaterialIcons','FontAwesome','Octicons','Entypo','Feather','EvilIcons'];
let iconModule = `import React from 'react';\n`;
for (const name of families) {
  const base = path.join(root,'node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons');
  const map = JSON.parse(fs.readFileSync(path.join(base,'glyphmaps',name+'.json'),'utf8'));
  const font = fs.readFileSync(path.join(base,'Fonts',name+'.ttf')).toString('base64');
  iconModule += `const map${name}=${JSON.stringify(map)};\nconst style${name}=document.createElement('style');style${name}.textContent='@font-face{font-family:${name};src:url(data:font/ttf;base64,${font})}';document.head.append(style${name});\nexport const ${name}=({name,size=16,color,style})=><span aria-hidden="true" style={{fontFamily:'${name}',fontSize:size,color,display:'inline-flex',alignItems:'center',justifyContent:'center',flexShrink:0,...style}}>{String.fromCodePoint(map${name}[name]||0)}</span>;\n`;
}
mocks['@expo/vector-icons'] = iconModule;
esbuild.build({
  entryPoints:[path.join(root,'scripts/readme/fixture.jsx')],bundle:true,outfile:path.join(out,'bundle.js'),
  jsx:'automatic',nodePaths:[path.join(root,'node_modules')],resolveExtensions:['.web.tsx','.web.ts','.web.js','.tsx','.ts','.jsx','.js','.json'],
  alias:{'react-native':'react-native-web'},loader:{'.js':'jsx','.ttf':'dataurl','.png':'dataurl'},
  define:{global:'globalThis','process.env':'{}',__DEV__:'false','process.env.NODE_ENV':'"production"'},
  plugins:[{name:'readme-fixtures',setup(build){
    build.onResolve({filter:/.*/},args=>mocks[args.path]?{path:args.path,namespace:'fixtures'}:undefined);
    build.onLoad({filter:/.*/,namespace:'fixtures'},args=>({contents:mocks[args.path],loader:'jsx',resolveDir:root}));
    build.onLoad({filter:/src\/routes\/index\.tsx$/},args=>({contents:fs.readFileSync(args.path,'utf8')+'\nexport {Home};',loader:'tsx',resolveDir:path.dirname(args.path)}));
  }}],
}).then(()=>{
  const fonts=['Regular','Bold','Light'].map(name=>`@font-face{font-family:Montserrat-${name};src:url(data:font/ttf;base64,${fs.readFileSync(path.join(root,'src/fonts/Montserrat-'+name+'.ttf')).toString('base64')})}`).join('');
  fs.writeFileSync(path.join(out,'index.html'),`<!doctype html><html lang="es"><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta charset="utf-8"><style>${fonts}html,body,#app{height:100%;margin:0}#app{display:flex;flex-direction:column}*{box-sizing:border-box}</style></head><body><div id="app"></div><script src="bundle.js"></script></body></html>`);
}).catch(()=>process.exit(1));
