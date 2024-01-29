/*
 * jQuery LargeTable plugin 1.00
 *
 * Copyright (c) 2018-2024 Michael Daum http://michaeldaumconsulting.com
 *
 * Licensed under the GPL license http://www.gnu.org/licenses/gpl.html
 *
 */

"use strict";
(function($) {

  // Create the defaults once
  var defaults = {
    stickyHeader: false,
    height: null,
    alwaysOn: false,
    scrollToRow: null,
    scrollToCol: null
  };

  function LargeTable(elem, opts) {
    var self = this;

    self.elem = $(elem).wrap("<div class='jqLargeTableContainer'></div>");
    self.container = self.elem.parent();

    // gather options by merging global defaults, plugin defaults and element defaults
    self.opts = $.extend({}, defaults, self.elem.data(), opts);

    self.button = $("<button><i class='fa fa-expand'></i></button>").addClass("jqLargeTableButton");
    self.button.prependTo(self.container);
    self.table = self.elem.is("table") ? self.elem : self.elem.find("table:first");
    self.thead = self.table.find("thead:first");

    self.elem.addClass("jqLargeTable inited");

    // init table
    if (self.opts.stickyHeader && self.opts.height) {
      self.elem.addClass("jqLargeTableStickyHeader");
      self.elem.height(self.opts.height);
    }
    if (self.opts.scrollToRow) {
      var row = self.elem.find("tbody > tr:nth-child("+(self.opts.scrollToRow-self.thead.length)+")");
      if (row.length) {
        self.elem.scrollTop(row.position().top);
      }
    }
    if (self.opts.scrollToCol) {
      var col = self.elem.find("tbody > tr:first > td:nth-child("+self.opts.scrollToCol+")");
      //console.log("scrollToCol",self.opts.scrollToCol,"col=",col.get());
      if (col.length) {
        self.elem.scrollLeft(col.position().left);
      }
    }

    // init events
    self.container.on("mouseenter", function() {
      self.container.addClass("over");
    }).on("mouseleave", function() {
      self.container.removeClass("over");
    });

    // init button
    self.button.on("click", function() { 
      self.setFullscreen();
      return false;
    });

    // init scroll
    self.elem.on("scroll", function() {
      self.setSticky();
    });

    // enable/disable when resizing
    $(window).on("resize", function() {
      //console.log("got resize event");
      self.setState();
    });

    // set initial state
    self.setState();
  }

  LargeTable.prototype.setSticky = function() {
    var self = this, 
        scrollTop, offset;

    if (!self.container.is(".fullscreen")) {
      return;
    }

    scrollTop = $(window).scrollTop();
    offset = self.table.offset();

    if (offset.top < scrollTop) {
      if (!self.theadClone) {
        self.theadClone = self.thead.clone().wrap("<table />").parent().prependTo(self.elem).addClass("sticky").addClass(self.table.prop("class"));
        self.theadClone.find("thead > tr").children().each(function(i) {
          var width = self.thead.find("tr:first").children().eq(i).width() + 2;
          $(this).width(width);
        });
      }
      self.theadClone.css("left", offset.left);
    } else {
      self.removeHeadClone();
    }

  };

  LargeTable.prototype.removeHeadClone = function () {
    var self = this;

    if (typeof(self.theadClone) !== 'undefined') {
      self.theadClone.remove();
      self.theadClone = undefined;
    }
  };

  LargeTable.prototype.setFullscreen = function () {
    var self = this;

    self.container.toggleClass("fullscreen");

    if (self.container.is(".fullscreen")) {
      self.scroll = $(window).scrollTop();
      self.button.find("i").removeClass("fa-expand").addClass("fa-compress");
      $("html").addClass("jqLargeTableFixedHtml");
    } else {
      $("html").removeClass("jqLargeTableFixedHtml");
      self.button.find("i").removeClass("fa-compress").addClass("fa-expand");
      $(window).scrollTop(self.scroll);
      self.table.find("thead:first").removeClass("sticky");
      self.removeHeadClone();
    }
  };

  // show/hide button based on the parent's size
  LargeTable.prototype.setState = function () {
    var self = this,
        containerWidth = self.container.width(),
        tableWidth = self.table.width();

    //console.log("setState containerWidth=",containerWidth,"tableWidth=",tableWidth);
    if (!self.opts.alwaysOn && tableWidth < containerWidth) {
      self.container.removeClass("enabled");
      //console.log("... NOT enabling",self.elem[0]);
    } else {
      self.container.addClass("enabled");
      //console.log("... enabling",self.elem[0]);
    }
  };

  // A plugin wrapper around the constructor,
  // preventing against multiple instantiations
  $.fn.largeTable = function (opts) {
    return this.each(function () {
      if (!$.data(this, "LargeTable")) {
        $.data(this, "LargeTable", new LargeTable(this, opts));
      }
    });
  };

  // Enable declarative widget instanziation
  $(function() {
    $(".jqLargeTable:not(.inited)").livequery(function() {
      $(this).largeTable();
    });
  });

})(jQuery);
