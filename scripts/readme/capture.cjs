const path = require('path');
const fs = require('fs');
const {chromium} = require(path.join(process.env.README_TOOLS_DIR, 'playwright'));
(async()=>{
  const browser = await chromium.launch({headless:true});
  const output = path.join(process.cwd(), '.github/img/personal/current');
  fs.mkdirSync(output, {recursive:true});
  const errors = [];
  process.on('unhandledRejection',error=>{console.error(error);process.exit(1);});
  for (const theme of ['light','dark']) {
    const page = await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,locale:'es-ES',colorScheme:theme});
    page.on('pageerror',e=>errors.push(e.message));
    page.on('console',m=>{if(m.type()==='error') errors.push(m.text());});
    await page.route(/^https?:/,route=>route.abort());
    await page.goto(`file:///tmp/abacus-readme-ui/index.html?theme=${theme}`);
    const save = async name => {
      await page.evaluate(async()=>{
        await Promise.all(['AntDesign','Ionicons','MaterialCommunityIcons','MaterialIcons','Montserrat-Regular','Montserrat-Bold'].map(font=>document.fonts.load(`16px ${font}`)));
        await document.fonts.ready;
      });
      await page.waitForTimeout(500);
      if (await page.getByText('Something went wrong!', {exact:true}).count()) throw Error('Screen error boundary');
      if (await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)) throw Error('Horizontal overflow');
      await page.getByTestId('navigation_chart_tab').waitFor();
      await page.screenshot({path:path.join(output,`${name}-${theme}.png`)});
    };
    await page.getByText('Resultado del periodo',{exact:true}).waitFor();
    await save('home');
    await page.getByTestId('navigation_chart_tab').click();
    await page.locator('svg').first().waitFor();
    await save('charts');
    await page.getByTestId('navigation_transactions_tab').click();
    await page.getByText('Supermercado',{exact:true}).waitFor();
    await save('movements');
    await page.close();
  }
  await browser.close();
  if(errors.length) throw Error(errors.join('\n'));
  console.log('PASS: six current app screen captures; real tab navigation, synthetic data, no page errors or horizontal overflow.');
})().catch(e=>{console.error(e);process.exit(1)});
