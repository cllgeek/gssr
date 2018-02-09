const fs = require('fs')
const path = require('path')
const existsSync = fs.existsSync

module.exports = (configPath) => {
  let pathconf = path.join(process.cwd(),configPath),cache = null;
  if(existsSync(pathconf)){
      console.log('\n load rule from ' + configPath)
  }
  try{
      cache = require(pathconf)
  }catch(e){
      console.log(configPath + 'parse error')
  }
  return cache 
}