function HackTheDailies () {

 this.init = function () {
   console.log('bla');
 }

 this.getAccount = function () {
   fetch('https://hackthedailies.vercel.app/api/getaccount')
   .then(raw => raw.json())
   .then(json => {
     if (!json) {
       return {
         notFound: true,
       }
     } else {
       console.log(json);
     }
 }

}

new HackTheDailies().init()
