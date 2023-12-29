const AppError = require('../utils/AppError');
const sendResponse = require('../utils/sendResponse');
const puppeteer = require('puppeteer');

async function dataScrapper(req, res, next) {
  const url = req.body.url;
  const experienceList = [];
  await scrapper();

  async function scrapper() {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: false,
      userDataDir: './tmp',
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    // var context = await browser.createIncognitoBrowserContext();

    // var page = await context.newPage();
    await page.goto('https://linkedin.com/');

    const pageTitle = (await page.title()).toString().trim();

    if(pageTitle.includes("Feed | LinkedIn")){
      await profileFetch();
      console.log('here');
    } else {
      await loginUser();
    }

    async function loginUser() {
      const emailSelector = '.text-color-text';
      const crenditals = await page.$$(emailSelector);
      var item = 0;
      // for(const crendital of crenditals){
      //   await page.evaluate((el)=> el.value = 'arfin.primetech@gmail.com',crendital)
      // }

      await page.type('input[type="text"]', 'arfin.primetech@gmail.com');
      await page.type('input[type="password"]', '#5431879abc@');
      await page.click('button[type="submit"]');
    }

    async function profileFetch() {
      await page.goto(url);
      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36'
      );

      const userNameSelector = '.text-heading-xlarge';
      const text = await page.waitForSelector(userNameSelector);
      const fullTitle = (await text?.evaluate((el) => el.textContent)).toString().trim();

      const userBioSelecttor = '.text-body-medium';
      const bioText = await page.waitForSelector(userBioSelecttor);
      const bioTitle = (await bioText?.evaluate((el) => el.textContent)).toString().trim();

      const locationSelector = 'div.pv-text-details__left-panel > .text-body-small';
      const locationText = await page.waitForSelector(locationSelector);
      const locationTitle = (await locationText?.evaluate((el) => el.textContent))
        .toString()
        .trim();

      let experienceTitle;

      try {
        const experienceSelector = 'span.pv-text-details__right-panel-item-text > div';
        const experienceText = await page.waitForSelector(experienceSelector);
        experienceTitle = (await experienceText?.evaluate((el) => el.textContent))
          .toString()
          .trim();
      } catch (err) {
        experienceTitle = '';
      }

      var userInfo = {
        title: fullTitle,
        bio: bioTitle,
        location: locationTitle,
        experience: experienceTitle,
      };

      await browser.close();

      sendResponse({
        statusCode: 200,
        status: 'success',
        payload: userInfo,
        success: true,
        message: 'Scrapping successfull',
        res,
      });

      // const productsHandles = await page.$$(
      //   "ul.pvs-list > .artdeco-list__item"
      // );
      // for (const producthandle of productsHandles) {
      //   var title = await page.evaluate(
      //     (el) => el?.querySelector("li.artdeco-list__item > div.profile-section-card__contents > h3")?.textContent,
      //     producthandle
      //   );

      //   var subtitle = await page.evaluate(
      //     (el) => el?.querySelector("li.experience-item > div.profile-section-card__contents > h4")?.textContent,
      //     producthandle
      //   );

      //   var time = await page.evaluate(
      //     (el) => el?.querySelector("li.experience-item > div.profile-section-card__contents > div.profile-section-card__meta > p > span")?.textContent,
      //     producthandle
      //   );

      //   console.log(time)
      //   var experience = {
      //     'title' : title?.toString().trim(),
      //     'subtitle' : subtitle?.toString().trim(),
      //     'time' : time?.toString().trim(),
      //   }

      //   experienceList.push(experience)
      // }
    }
  }
}

module.exports = {
  dataScrapper,
};
