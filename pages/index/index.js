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
    //dialog: false,
    //autoplay: false,
    ui: {
      windowWidth: 0,
      menuWidth: 0,
      offsetLeft: 0,
      tStart: true

    },
    buttonClicked: false, //是否点击跳转
    //--------首页显示内容---------
    postsList: [], //总的活动
    //postsShowSwiperList: [], //轮播图显示的活动
    currentPage: 0, //要跳过查询的页数
    limitPage: 6,//首先显示6条数据（之后加载时都增加3条数据，直到再次加载不够6条）
    isEmpty: false, //当前查询出来的数据是否为空
    totalCount: 0, //总活动数量
    endPage: 0, //最后一页加载多少条
    totalPage: 0, //总页数
    curIndex: 0,
    windowHeight1: 0,
    windowWidth1: 0,

  },


  onLoad(t) {
    var self = this;
    this.fetchPostsData()
    try {
      let res = wx.getSystemInfoSync()
      this.windowWidth = res.windowWidth;
      this.data.ui.menuWidth = this.windowWidth * MENU_WIDTH_SCALE;
      this.data.ui.offsetLeft = 0;
      this.data.ui.windowWidth = res.windowWidth;
      this.setData({ ui: this.data.ui })
    } catch (e) {
    }
  },

  onShow: function (e) {
    this.data.userInfo = app.globalData.userInfo
    this.onLoad()
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

  //数据存储
  onSetData: function (data) {
    let page = this.data.currentPage + 1;
    //设置数据
    data = data || [];
    this.setData({
      postsList: page === 1 || page === undefined ? data : this.data.postsList.concat(data),
    });
    console.log(this.data.postsList, page);
  },

  //数据存储
  onSetData: function (data) {
    let page = this.data.currentPage + 1;
    //设置数据
    data = data || [];
    this.setData({
      postsList: page === 1 || page === undefined ? data : this.data.postsList.concat(data),
    });
    console.log(this.data.postsList, page);
  },

  //获取首页列表文章
  fetchPostsData: function (data) {
    var self = this;
    //获取详询活动信息
    var molist = new Array();
    var Diary = Bmob.Object.extend("Events");
    var query = new Bmob.Query(Diary);
    query.limit(self.data.limitPage);
    query.skip(3 * self.data.currentPage);
    query.descending("createdAt"); //按照时间降序
    query.include("publisher");
    query.find({
      success: function (results) {
          var count = results.length;
          var totalPage = 0;
          var endPage = 0;
          if (count % self.data.limitPage == 0) {//如果总数的为偶数
            totalPage = parseInt(count / self.data.limitPage);
          } else {
            var lowPage = parseInt(count / self.data.limitPage);
            endPage = count - (lowPage * self.data.limitPage);
            totalPage = lowPage + 1;
          }
          self.setData({
            totalCount: count,
            endPage: endPage,
            totalPage: totalPage
          })
          console.log("共有" + count + " 条记录");
          console.log("共有" + totalPage + "页");
          console.log("最后一页加载" + endPage + "条");
      
        for (var i = 0; i < results.length; i++) {
          var publisherId = results[i].get("publisher").objectId;
          var title = results[i].get("title");
          var discription = results[i].get("discription");
          var acttype = results[i].get("acttype");
          var endtime = results[i].get("endtime");
          var address = results[i].get("address");
          var acttypename = getTypeName(acttype); //根据类型id获取类型名称
          var num_limit = results[i].get("num_limit");
          var id = results[i].id;
          var createdAt = results[i].createdAt;
          var pubtime = util.getDateDiff(createdAt);
          var publisherName = results[i].get("publisher").nickname;
          var publisherPic = results[i].get("publisher").userPic;
          var status = app.globalData.statusL[results[i].get('status')]
          var jsonA;
          jsonA = {
            "title": title || '',
            "discription": discription || '',
            "acttype": acttype || '',
            "acttypename": acttypename || '',
            "endtime": endtime || '',
            "address": address || '',
            "num_limit": num_limit || '',
            "id": id || '',
            "publisherPic": publisherPic || '',
            "publisherName": publisherName || '',
            "publisherId": publisherId || '',
            "pubtime": pubtime || '',
            "status":status || '',
          }
          molist.push(jsonA);
        }
        self.onSetData(molist, self.data.currentPage);
        setTimeout(function () {
          wx.hideLoading();
        }, 900);
      },
      error: function (error) {
        console.log(error)
      }
    })
  },

  //加载下一页
  loadMore: function () {
    wx.showLoading({
      title: '正在加载',
      mask: true
    });
    //一秒后关闭加载提示框
    setTimeout(function () {
      wx.hideLoading()
    }, 1000)
    var self = this;
    self.setData({
      currentPage: self.data.currentPage + 1
    });
    console.log("当前页" + self.data.currentPage);
    //先判断是不是最后一页
    if (self.data.currentPage + 1 == self.data.totalPage) {
      self.setData({
        isEmpty: true
      })
      if (self.data.endPage != 0) { //如果最后一页的加载不等于0
        self.setData({
          limitPage: self.data.endPage,
        })
      }
      this.fetchPostsData(self.data);
    } else {
      this.fetchPostsData(self.data);
    }
  },


  //点击刷新
  refresh: function () {
    this.setData({
      postsList: [], //总的活动
      currentPage: 0, //要跳过查询的页数
      limitPage: 3,//首先显示3条数据（之后加载时都增加3条数据，直到再次加载不够3条）
      isEmpty: false, //当前查询出来的数据是否为空
      totalCount: 0, //总活动数量
      endPage: 0, //最后一页加载多少条
      totalPage: 0, //总页数
      curIndex: 0,
      windowHeight1: 0,
      windowWidth1: 0,
    })
    this.onLoad();
  },

  // 点击活动进入活动详情页面
  click_activity: function (e) {
    if (!this.buttonClicked) {
      util.buttonClicked(this);
      let actid = e.currentTarget.dataset.actid;
      let pubid = e.currentTarget.dataset.pubid;
      let user_key = wx.getStorageSync('user_key');
      wx.navigateTo({
        url: '/pages/detail/detail?actid=' + actid + "&pubid=" + pubid
      });
    }
  },
  //点击搜索
  click_search: function () {
    if (!this.buttonClicked) {
      util.buttonClicked(this);
      console.log(getCurrentPages())
      wx.navigateTo({
        url: '/pages/search/search',
      });
    }
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
  },})


//根据活动类型获取活动类型名称
function getTypeName(acttype) {
  var acttypeName = "";
  if (acttype == 1) acttypeName = "未名一";
  else if (acttype == 2) acttypeName = "未名二";
  else if (acttype == 3) acttypeName = "燕南一";
  else if (acttype == 4) acttypeName = "燕南二";
  else if (acttype == 5) acttypeName = "求知一";
  else if (acttype == 6) acttypeName = "求知二";
  else if (acttype == 7) acttypeName = "博雅一";
  else if (acttype == 8) acttypeName = "博雅二";
  else if (acttype == 9) acttypeName = "朗润一";
  else if (acttype == 10) acttypeName = "朗润二";
  return acttypeName;
}