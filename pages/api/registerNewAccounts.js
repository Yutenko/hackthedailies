const puppeteer = require('puppeteer')
const generator = require('generate-password')
const fs = require('fs')
const path = require('path')

const BZ_REGISTER_MAIL_SITE = 'https://login.bernerzeitung.ch/register/email'
const BZ_INPUT_EMAIL = '#emailField'
const BZ_INPUT_PASSWORD = '#password'

const TEN_MIN_MAIL_SITE = 'https://10minemail.com'
const TMM_INPUT_MAIL = '#mail'
const TMM_COOKIE_TOKEN = 'token'

const REGEX_CONFIRM_LINK = /'https:\/\/login.bernerzeitung.ch'/

let TMM = null
let TMM_TOKEN = null
let PASSWORD = null

let POLL_FREQUENCY = 10000
let browser = null
let ttm_page = null

async function createPassword(cb) {
  const password = generator.generate({
	 length: 10,
	 numbers: true
 })
 PASSWORD = password
 cb()
}

function getCookieToken (cookies) {
  const c = cookies.filter(c => c.name === TMM_COOKIE_TOKEN)
  if (c[0] && c[0].value) {
    return c[0].value
  }
  return null
}

async function createTenMinuteMail(cb) {
  browser = await puppeteer.launch({
      headless: false
  });
  ttm_page = await browser.newPage();
  await ttm_page.goto(TEN_MIN_MAIL_SITE);
  TMM = await ttm_page.evaluate(element => element.value, await ttm_page.$('#mail') )
  const cookies = await ttm_page.cookies()
  const token = getCookieToken(cookies)
  if (token) {
    TMM_TOKEN = token
  }
  cb()
}

async function registerNewAccount(cb) {
    if (TMM && PASSWORD && TMM_TOKEN) {
      const page = await browser.newPage();
      await page.goto(BZ_REGISTER_MAIL_SITE);
      await page.type(BZ_INPUT_EMAIL, TMM);
      await page.keyboard.press('Enter');
      await page.waitForNavigation();
      await page.type(BZ_INPUT_PASSWORD, PASSWORD);
      await page.keyboard.press('Enter');
      await page.waitForNavigation();
    }
    cb()
}

async function confirmEmail(cb) {
  ttm_page.bringToFront()
  await ttm_page.waitFor(1000)

  let activated = false
  while (!activated) {
    const example = await ttm_page.$$('.m-link-view');

    if (example && example[1]) {
      await example[1].click();
      await ttm_page.waitForNavigation();
      activated = true
    }
    await ttm_page.waitFor(POLL_FREQUENCY);
  }

  await clickByText(ttm_page, `E-Mail Adresse verifizieren`);

  browser.close()
  cb()
}

const escapeXpathString = str => {
  const splitedQuotes = str.replace(/'/g, `', "'", '`);
  return `concat('${splitedQuotes}', '')`;
};

const clickByText = async function(page, text, element) {
    element = element || 'a';
    const escapedText = escapeXpathString(text);
    xpath = `//*[text()[contains(., ${escapedText})]]`;
    const elements = await page.$x(xpath);
    if(elements.length > 0) {
        for(i in elements) {
            e = elements[i];
            if(await e.isIntersectingViewport()) {
                await e.click();
                return;
            }
        }
    }
    else {
        console.log(xpath);
    }

    throw new Error(`Link not found: ${text}`);
};

function writeJSON (accounts,cb) {
  let data = ''
  accounts.map(credentials => data += JSON.stringify(credentials))
  const location = path.join(process.cwd(), 'public', 'accounts.json')
  fs.writeFileSync(location, data);
  cb()
}

///////////
export default function renewAccounts (cb) {
  let accountNumber = 5
  let accounts = []

  function makeNewOne (counter) {
    registerNewAccount((account) => {
      accounts.push(account)
      if (counter === 0) {
        writeJSON(accounts,cb)
      } else {
        makeNewOne(counter--)
      }
    })
  }

  makeNewOne(accountNumber)
}


function registerNewAccount (cb) {
  createPassword(
    () => createTenMinuteMail(
      () => registerNewAccount(
        () => confirmEmail(
          () => {
            cb({
              mail:TMM,
              password:PASSWORD,
              created:new Date.now()
            })
          }
        )
      )
    )
  )
}
