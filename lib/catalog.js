const fs = require('fs'),
      path = require('path');

module.exports = (_path) => {
    const css = fs.readFileSync(__dirname + '/ssr.css')

    const html_str = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>gssr</title><style>$css$</style></head><body>' + 
    '<h1>$path$</h1><ul>$html$</ul><div class="copyright">Powered by <a href="https://github.com/cllgeek/gssr" target="_blank">gssr</a>. Dependence <a href="https://nodejs.org">Node.js</a> run.</div></body></html>'

    _root_path = _path.replace(process.cwd(),'')

    // 非文件夹处理

    if(!isDir(_path)) _path = path.dirname(_path)

    if(!exists(_path)){
        return temp(html_str,{
            path: breadcrumb(_root_path),
            css: css,
            html: "404 Not Found: "+_path
        })
    }

    const files = sortDir(_path)
    let html = '',_root =''
    
    for(let i=0;i<files.length;i++){
        _root = _path.replace(process.cwd()+'/','')+'/'
        _root = '/' + _root + files[i]
        if(/^\/\//.test(_root)){
            _root = _root.replace('//','/')
        }

        let _class = ''

        if(isDir(_root) || isDir(process.cwd()+_root)) _class = 'dir'
        _root = _root.replace(process.cwd(),'')

        html += `<li class=${_class}><a href=${_root}>${files[i]}</a></li>\n`
    }
    if(html === ''){
        html += '<li>No files in the current directory!</li>'
    }

    return temp(html_str,{
        path: breadcrumb(_root_path),
        css: css,
        html: html
    })
}

// 字符串路径转换成路径导航
const breadcrumb = (str,path) => {
    if(str === '/') return str
    let arr = str.split('/');
    let _str = ''
    path = ''
    for(let i = 0;i<arr.length;i++){
        path += '/' + arr[i]
        path = path.replace('//','/')
        _str += (arr[i]?'<a href="'+path+'">'+arr[i]+'</a>'+(i===arr.length-1?'':'/'):'/');
    }
    return _str
}

//重新排序 - 将文件夹排序到最前面的
const sortDir = (_path) => {
    let arr = fs.readdirSync(_path),arr_dir=[],arr_file=[];

    for(let i=0;i<arr.length;i++){
        if(isDir(_path + '/' + arr[i])){
            arr_dir.push(arr[i])
        }else{
            arr_file.push(arr[i])
        }
    }

    return arr_dir.concat(arr_file)
}

//检查指定路径的文件或者目录是否存在
const exists = (path) => {
    return fs.existsSync(path)
}

//判断是不是目录
const isDir = (path) => {
    return exists(path) && fs.statSync(path).isDirectory()
}

const temp = (str,obj) => {
    return str.replace(/\$\w+\$/gi,(matchs)=>{
        const returns = obj[matchs.replace(/\$/g,"")]
        return typeof returns === "undefined" ? "" : returns
    })
}