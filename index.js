const http = require('http'),
			url = require('url'),
			path = require('path'),
			fs = require('fs'),
			net = require('net'),
			color = require('colors-cli'),
			iconv = require('iconv-lite'),
			ctype = require('./lib/content-type'),
			catalog = require('./lib/catalog'),
			confproxy = require('./lib/get-proxy-config'),
			query = require('querystring'),  // 解析POST请求,
			__port = 1994,
			cors = false,
			server;
			require('colors-cli/toxic');

connListener = (req,res) => {
	const uri = url.parse(req.url).pathname,
				fileName = path.join(process.cwd(), uri),
				_header =  !cors ? {

				} : {
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,OPTIONS",
					"Access-Control-Allow-Headers": "Content-Type, Authorization, Content-Length, X-Requeseted-With, Accept, x-csrf-token, origin"
				};
	
			const ext = path.parse(req.url.replace(/\?.*$/g,"")).ext.replace('.',''); //获取扩展名
			const pxval = confproxy[req.method + '' + uri];
			if(pxval){
				const postData = null,arr = [];
				req.addListener("data",(postchunk)=>{
					arr.push(postchunk)
				})

				//POST结束输出结果
				req.addListener("end",()=>{
					const data = Buffer.concat(arr).toString(),ret;
					try{
						ret = JSON.parse(data);
					}catch(err){}
					req.body = ret;

					if(typeof pxval === 'function'){
						pxval = pxval(ret?ret:data,request.url);
					}

					res.writeHead(200, {
						"Content-Type": (()=>{
							if(isJson(pxval) || Object.prototype.toString.call(pxval)){
								return ctype.getContentType('json') + ';charset=utf-8';
							}else if(typeof pxval === 'string'){
								return ctype.getContentType('html')
							}
							return '';
						})()
					})
					res.writeHead(200,_header);
					res.write( iconv.encode(JSON.stringify(pxval), 'utf-8').toString('binary') , 'binary')
					res.end()
					commandLog(200,req,res)
				})
				return
			}

			if(ext) _header['Content-Type'] = ctype.getContentType(ext)

			// url 解码
			filename = decodeURIComponent(filename)

			const html = catalog(process.cwd()+req.url)
}