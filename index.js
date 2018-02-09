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
				filename = path.join(process.cwd(), uri),
				_header =  !cors ? {

				} : {
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,OPTIONS",
					"Access-Control-Allow-Headers": "Content-Type, Authorization, Content-Length, X-Requeseted-With, Accept, x-csrf-token, origin"
				};
	
			const ext = path.parse(req.url.replace(/\?.*$/g,"")).ext.replace('.',''); //获取扩展名
			const pxval = confproxy[req.method + '' + uri];
			if(pxval){
				let postData = null,arr = [];
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

			if( fs.existsSync(filename) && fs.statSync(filename).isDirectory() && fs.existsSync(filename + '/index.html')) filename += 'index.html'
			if( fs.existsSync(filename) && fs.statSync(filename).isFile()){
				fs.readFile(filename,"binary",(err,file)=>{
					res.writeHead(200,_header)
					res.write(file,"binary")
					res.end()
					commandLog(200,req,res)
					return
				})
			}else{
				res.writeHead(404,{})
				res.write(html)
				res.end()
				commandLog(404,req,res)
				return
			}
}

const isJson = (obj) => {
	return typeof(obj) === "object" && Object.prototype.toString.call(obj).toLowerCase() === "[object object]" && !obj.length
}

// 命令行颜色显示
const commandLog = (status,req,res) => {
	const code = res.statusCode
	if(code === 200){
		console.log(('INFO ' + req.method + ' ' + code.toString() ).green_bt + ' ' + req.url)
	}else{
		console.log(('INFO ' + req.method + ' ' + code.toString()).red_bt + '' + req.url)
	}
}

// 检测port是否存在
const probe = (port, callback) => {
	const server = net.createServer().listen(port)
	
	let calledOnce = false

	const timeoutRef = setTimeout(()=>{
		calledOnce = true
		callback(false,port)
	},2000)

	timeoutRef.unref()

	let connected = false

	server.on('listening',()=>{
		clearTimeout(timeoutRef)

		if(server) server.close()

		if(!calledOnce){
			calledOnce = true
			callback(true,port)
		}
	})

	server.on('error',(err)=>{
		clearTimeout(timeoutRef)

		let result = true
		if(err.code === 'EADDRINUSE') result = false

		if(!calledOnce){
			calledOnce = true
			callback(result,port)
		}
	})
}

// 启动服务
const serverStart = (_port) =>{
	probe(_port,(bl,_pt)=>{
		if(bl === true){
			server = http.createServer(connListener)
			server = server.listen(parseInt(_pt,10))
			console.log("\n  Static file server running at" + color.green("\n\n=> http://localhost:" + _pt ) + '\n')
		}else{
			serverStart(_pt+1)
		}
	})
}

const server = (argv) => {
	let pt = ''

	if(argv && argv.port) pt = argv.port
	else pt = __port
	
	if(argv && argv.port === true) pt = __port

	(argv && argv.cors) ? cors = true : cors = false

	if(argv && argv.proxy){
		confproxy = confproxy(argv.proxy)
	}

	serverStart(pt)
}