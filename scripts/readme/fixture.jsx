import React from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Home} from '../../src/routes';
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');
moment.now = () => Date.UTC(2026, 9, 14, 12);
const theme = new URLSearchParams(location.search).get('theme') || 'light';
const accounts = [
  ['1','Cuenta principal','2948.70','1207.70'],
  ['2','Ahorro','2400.00','150.00'],
  ['3','Efectivo','300.00','-28.80'],
].map(([id,name,currentBalance,balanceDifference])=>({id,display:true,attributes:{name,type:'asset',currencyCode:'EUR',currentBalance,balanceDifference,includeNetWorth:true}}));
const entries = [
  ['Supermercado','24.50','withdrawal','Alimentación','2026-10-14'],
  ['Café con amigos','6.80','withdrawal','Ocio','2026-10-14'],
  ['Nómina','1850.00','deposit','Trabajo','2026-10-13'],
  ['Compra semanal','82.00','withdrawal','Alimentación','2026-10-12'],
  ['Gasolina','45.00','withdrawal','Transporte','2026-10-11'],
  ['Alquiler','450.00','withdrawal','Vivienda','2026-10-10'],
  ['Suscripción','12.00','withdrawal','Ocio','2026-10-09'],
].map(([description,amount,type,categoryName,date],index)=>({id:String(index+1),type:'transactions',attributes:{groupTitle:'',transactions:[{description,amount,type,categoryName,date:date+'T12:00:00Z',currencyCode:'EUR',sourceName:type==='deposit'?'Empresa':'Cuenta principal',destinationName:type==='deposit'?'Cuenta principal':description,sourceId:type==='deposit'?8:1,destinationId:type==='deposit'?1:9,tags:['Casa'],notes:''}]}}));
const chart = (id, values) => ({label:accounts[id].attributes.name,title:accounts[id].attributes.name,color:['#7554D5','#299779','#C65A76'][id],currencyCode:'EUR',minY:Math.min(...values),maxY:Math.max(...values),entries:values.map((y,i)=>({x:Date.UTC(2026,9,i+1),y}))});
const state = {
  configuration:{preferredColorScheme:theme,selectedBrandStyle:'#7554D5',selectedTheme:'gradientPurple',backendURL:'https://firefly.example.com',unavailableRequests:{},hideBalance:false,tapToHideNetWorth:false,hideNetWorth:false,displayAllAccounts:false,displayOnlyExpenseCategories:false,displayForeignCurrency:false,useBiometricAuth:false,closeTransactionScreen:false,apiVersion:'2.1',serverVersion:'6.4.0'},
  firefly:{rangeDetails:{range:1,start:'2026-10-01',end:'2026-10-31',title:'oct 2026'},netWorth:[{monetaryValue:'5648.70'}],earned:[{monetaryValue:'1850.00'}],spent:[{monetaryValue:'642.30'}],balance:[{monetaryValue:'1207.70'}],accounts:[chart(0,[1741,1700,1680,1650,1590,1570,1560,1530,1500,1050,1005,923,2773,2742]),chart(1,[2250,2250,2250,2250,2250,2250,2250,2250,2250,2250,2250,2250,2400,2400])],earnedChart:[{x:Date.UTC(2026,9,13),y:1850}],spentChart:[{x:Date.UTC(2026,9,10),y:450},{x:Date.UTC(2026,9,12),y:82}]},
  accounts:{accounts,selectedAccountIds:[]},currencies:{currentCode:'EUR',currencies:[{id:'1',attributes:{code:'EUR',name:'Euro',symbol:'€',decimalPlaces:2}}]},
  categories:{insightCategories:[],categories:[]},budgets:{insightBudgets:[],budgets:[]},bills:{bills:[]},piggyBanks:{piggyBanks:[]},
  transactions:{page:1,totalPages:1,transactionPayload:{title:'',transactions:[]}},
  loading:{effects:Object.fromEntries(['firefly','accounts','transactions','currencies','categories','budgets','bills','piggyBanks','configuration'].map(k=>[k,new Proxy({}, {get:()=>({loading:false})})]))},
};
const noop = async()=>{};
const dispatch = Object.assign(()=>{},Object.fromEntries(['firefly','accounts','currencies','categories','budgets','bills','piggyBanks','configuration','transactions'].map(name=>[name,new Proxy({}, {get:(_,key)=>name==='transactions'&&key==='getTransactions'?async()=>entries:noop})])));
const store = {getState:()=>state,subscribe:()=>()=>{},dispatch};
createRoot(document.getElementById('app')).render(<Provider store={store}><SafeAreaProvider initialMetrics={{frame:{x:0,y:0,width:390,height:844},insets:{top:0,bottom:0,left:0,right:0}}}><NavigationContainer><Home/></NavigationContainer></SafeAreaProvider></Provider>);
