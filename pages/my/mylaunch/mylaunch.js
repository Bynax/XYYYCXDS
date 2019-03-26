var common = require('../../../utils/common.js')
var Bmob = require("../../../utils/bmob.js");
var util = require('../../../utils/util.js');
var app = getApp()
var my_auth;
var that;
Page({
  data: {
    postsList: [], //总的活动
    currentPage: 0, //要跳过查询的页数
    limitPage: 6,
    isEmpty: false, //当前查询出来的数据是否为空
    totalCount: 0, //总活动数量
    endPage: 0, //最后一页加载多少条
    totalPage: 0, //总页数
  },

  onLoad() {
    var self = this;
    this.getAll();
    this.fetchPostsData();
  },

  //数据存储
  onSetData: function(data) {
    let page = this.data.currentPage + 1;
    //设置数据
    data = data || [];
    this.setData({
      postsList: page === 1 || page === undefined ? data : this.data.postsList.concat(data),
    });
  },

  //获取总的发起数
  getAll: function() {
    self = this;
    var self = this;
    //获取详询活动信息
    var Diary = Bmob.Object.extend("Events");
    var query = new Bmob.Query(Diary);
    query.limit(self.data.limitPage);
    my_auth = wx.getStorageSync("my_auth")
    if(my_auth==null){
      //console.log("hello")

    }
    if (my_auth == 0) {} else {
      query.equalTo("publisher", wx.getStorageSync("user_id"));
    }
    query.count({
      success: function(count) {
        var totalPage = 0;
        var endPage = 0;
        if (count % self.data.limitPage == 0) { //如果总数的为偶数
          totalPage = parseInt(count / self.data.limitPage);
          console.log("ou",totalPage)
        } else {
          var lowPage = parseInt(count / self.data.limitPage);
          endPage = count - (lowPage * self.data.limitPage);
          totalPage = lowPage + 1;
          console.log("ji", totalPage)

        }
        self.setData({
          totalCount: count,
          endPage: endPage,
          totalPage: totalPage
        })
        if (self.data.currentPage + 1 >= self.data.totalPage) {
          self.setData({
            isEmpty: true
          })
        }
       
      },
      
    });
  },

  //加载下一页
  loadMore: function() {
    wx.showLoading({
      title: '正在加载',
      mask: true
    });
    //一秒后关闭加载提示框
    setTimeout(function() {
      wx.hideLoading()
    }, 1000)
    var self = this
    self.setData({
      currentPage: self.data.currentPage + 1
    });
    console.log("当前页" + self.data.currentPage);
    console.log("encpage",self.data.endPage)
    //先判断是不是最后一页
    if (self.data.currentPage + 1 >= self.data.totalPage) {
      self.setData({
        isEmpty: true
      })
      if (self.data.endPage != 0) { //如果最后一页的加载不等于0
        self.setData({
          limitPage: self.data.endPage
        })
      }
      this.fetchPostsData(self.data);
    } else {
      this.fetchPostsData(self.data);
    }
  },

  onShow: function() {
    this.onLoad();
  },

  //获取首页列表文章
  fetchPostsData: function (data) {
    var self = this;
    //获取详询活动信息
    var molist = new Array();
    var Diary = Bmob.Object.extend("Events");
    var query = new Bmob.Query(Diary);
    if (my_auth == null) {
      //console.log("hello")

    }
    if (my_auth == 0) { } else {
      query.equalTo("publisher", wx.getStorageSync("user_id"));
    }
    query.limit(self.data.limitPage);
    query.skip(self.data.limitPage * self.data.currentPage);
    query.descending("createdAt"); //按照时间降序
    query.include("publisher");
    query.find({
      success: function (results) {
        for (var i = 0; i < results.length; i++) {
          var publisherId = results[i].get("publisher").objectId;
          var title = results[i].get("title");
          var content = results[i].get("content");
          var acttype = results[i].get("acttype");
          var endtime = results[i].get("endtime");
          var address = results[i].get("address");
          var peoplenum = results[i].get("peoplenum");
          var id = results[i].id;
          var createdAt = results[i].createdAt;
          var pubtime = util.getDateDiff(createdAt);
          var publisherName = results[i].get("publisher").nickname;
          var publisherPic = results[i].get("publisher").userPic;
          var status = results[i].get("status")
          var jsonA;
          jsonA = {
            "title": title || '',
            "content": content || '',
            "acttype": acttype || '',
            "endtime": endtime || '',
            "address": address || '',
            "peoplenum": peoplenum || '',
            "id": id || '',
            "publisherPic": publisherPic || '',
            "publisherName": publisherName || '',
            "publisherId": publisherId || '',
            "pubtime": pubtime || '',
            "status": app.globalData.statusL[status] || '',

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

  onPullDownRefresh: function () {
    this.onShow();
    //模拟加载
    setTimeout(function () {
      wx.stopPullDownRefresh()

      // complete
    }, 1500);
  },
  // 点击活动进入活动详情页面
  click_activity: function(e) {
    let actid = e.currentTarget.dataset.actid;
    let pubid = e.currentTarget.dataset.pubid;
    let user_key = wx.getStorageSync('user_key');
    wx.navigateTo({
      url: '/pages/detail/detail?actid=' + actid + "&pubid=" + pubid
    });
  },

})