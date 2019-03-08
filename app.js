//app.js
import Touches from './utils/Touches.js'
//var Bmob = require("utils/bmob.js");
var common = require("utils/common.js");
 const __utils = require('utils/util')
App({
  version: 'v1.0', //版本号
  onLaunch: function() {
    var that = this;
    //调用系统API获取设备的信息
    wx.getSystemInfo({
      success: function(res) {
        var kScreenW = res.windowWidth / 375
        var kScreenH = res.windowHeight / 603
        wx.setStorageSync('kScreenW', kScreenW)
        wx.setStorageSync('kScreenH', kScreenH)
      }
    })
  },
  onShow: function() {

  },
  formate_data: function(date) {
    let month_add = date.getMonth() + 1;
    var formate_result = date.getFullYear() + '年' +
      month_add + '月' +
      date.getDate() + '日' +
      ' ' +
      date.getHours() + '点' +
      date.getMinutes() + '分';
    return formate_result;
  },

  globalData: {
    userInfo: null,
    user:null,
    statusL:["审核中","进行中","结束"]
  },
  onPullDownRefresh: function() {
    //wx.stopPullDownRefresh()
  },
  onError: function(msg) {},
  Touches: new Touches(),
  util: __utils,
})