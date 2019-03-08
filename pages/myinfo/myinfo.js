//wx-drawer
var common = require('../../utils/common.js')
var Bmob = require("../../utils/bmob.js");
var util = require('../../utils/util.js');
var app = getApp()
var curIndex = 0;
var that;
const MENU_WIDTH_SCALE = 0.82;
const FAST_SPEED_SECOND = 300;
const FAST_SPEED_DISTANCE = 5;
const FAST_SPEED_EFF_Y = 50;

var my_nick = wx.getStorageSync('my_nick')
var my_sex = wx.getStorageSync('my_sex')
var my_avatar = wx.getStorageSync('my_avatar')

Page({
  data: {
    my_nick: my_nick,
    my_sex: my_sex,
    my_avatar: my_avatar,
    userInfo: [],
    dialog: false,
    autoplay: false,
    ui: {
      windowWidth: 0,
      menuWidth: 0,
      offsetLeft: 0,
      tStart: true

    },
    
    windowWidth1: 0,

  },



  onLoad(t) {
     
  },

  onShow: function (e) {
    //this.onLoad();
    console.log('加载头像')
    var that = this
    that.data.userInfo = app.userInfo
    console.log(my_avatar+my_nick)
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          windowHeight1: res.windowHeight,
          windowWidth1: res.windowWidth,
          autoplay: true
        })
      }
    })
  },
  //进入我的发起
  click_myLaunch: function () {
    if (!this.buttonClicked) {
      util.buttonClicked(this);
      wx.navigateTo({
        url: '/pages/my/mylaunch/mylaunch',
      });
    }
  },
  
  //进入我的收藏
  click_myCollection: function () {
    if (!this.buttonClicked) {
      util.buttonClicked(this);
      wx.navigateTo({
        url: '/pages/my/mycollection/mycollection',
      });
    }
  },
//--------------------------------------------------------------------------------------------------------
  handlerStart(e) {
    let { clientX, clientY } = e.touches[0];
    this.tapStartX = clientX;
    this.tapStartY = clientY;
    this.tapStartTime = e.timeStamp;
    this.startX = clientX;
    this.data.ui.tStart = true;
    this.setData({ ui: this.data.ui })

  },
  handlerMove(e) {
    let { clientX } = e.touches[0];
    let { ui } = this.data;
    let offsetX = this.startX - clientX;
    this.startX = clientX;
    ui.offsetLeft -= offsetX;
    if (ui.offsetLeft <= 0) {
      ui.offsetLeft = 0;
    } else if (ui.offsetLeft >= ui.menuWidth) {
      ui.offsetLeft = ui.menuWidth;
    }
    this.setData({ ui: ui })

  },
  handlerCancel(e) {
    // console.log(e);
  },
  handlerEnd(e) {
    this.data.ui.tStart = false;
    this.setData({ ui: this.data.ui })
    let { ui } = this.data;
    let { clientX, clientY } = e.changedTouches[0];
    let endTime = e.timeStamp;
    //快速滑动
    if (endTime - this.tapStartTime <= FAST_SPEED_SECOND) {
      //向左
      if (this.tapStartX - clientX > FAST_SPEED_DISTANCE) {
        ui.offsetLeft = 0;
      } else if (this.tapStartX - clientX < -FAST_SPEED_DISTANCE && Math.abs(this.tapStartY - clientY) < FAST_SPEED_EFF_Y) {
        ui.offsetLeft = ui.menuWidth;
      } else {
        if (ui.offsetLeft >= ui.menuWidth / 2) {
          ui.offsetLeft = ui.menuWidth;
        } else {
          ui.offsetLeft = 0;
        }
      }
    } else {
      if (ui.offsetLeft >= ui.menuWidth / 2) {
        ui.offsetLeft = ui.menuWidth;
      } else {
        ui.offsetLeft = 0;
      }
    }
    this.setData({ ui: ui })

  },
  handlerPageTap(e) {
    let { ui } = this.data;
    if (ui.offsetLeft != 0) {
      ui.offsetLeft = 0;
      this.setData({ ui: ui })

    }
  },
  handlerAvatarTap(e) {
    let { ui } = this.data;
    if (ui.offsetLeft == 0) {
      ui.offsetLeft = ui.menuWidth;
      this.setData({ ui: ui })
    }
  },
})
