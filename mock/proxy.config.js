module.exports = {
    // Mock 数据返回
    'GET /users': [{name:'geekjc'}, {name:'极客教程'}],
    'GET /users/1': {name:'极客教程-你值得来的地方'},
    'POST /users':function(data,url){
        console.log("data:::",data,data.a,url);
        return {name:'哈哈哈哈'}
    },
    'POST /users/2':"22323sd",
};