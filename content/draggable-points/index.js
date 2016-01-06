'use strict';

// Copyright (c) 2015 Uber Technologies, Inc.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

var assign = require('object-assign');
var alphaify = require('alphaify');
var r = require('r-dom');
var React = require('react');
var MapGL = require('react-map-gl');
var Immutable = require('immutable');
var fs = require('fs');
var path = require('path');

var DraggablePoints =
require('react-map-gl/src/overlays/draggable-points.react');

var stamenMapStyle = require('../../common/stamen-map-style');
var CodeSnippet = require('../../common/code-snippet.react');
var Markdown = require('../../common/markdown.react');

var initialPoints = [
  {location: [-122.39508481737994, 37.79450507471435], id: 0},
  {location: [-122.39750244137034, 37.79227619464379], id: 1},
  {location: [-122.4013303460217, 37.789251178427776], id: 2},
  {location: [-122.40475531334141, 37.786862920252986], id: 3},
  {location: [-122.40505751634022, 37.78861431712821], id: 4},
  {location: [-122.40556118800487, 37.79060449046487], id: 5},
  {location: [-122.4088854209916, 37.790047247333675], id: 6},
  {location: [-122.4091876239904, 37.79275381746233], id: 7},
  {location: [-122.40989276432093, 37.795619489534374], id: 8},
  {location: [-122.41049717031848, 37.79792786675678], id: 9},
  {location: [-122.4109001076502, 37.80031576728801], id: 10},
  {location: [-122.41916032295062, 37.79920142331301], id: 11}
];

var pointIds = initialPoints[initialPoints.length - 1].id;

function FancyPoint(props) {
  return r.g([
    r.circle({
      r: 20,
      style: {
        fill: alphaify('#1FBAD6', 0.9),
        pointerEvents: 'all'
      }
    }),
    r.text({
      style: {fill: 'white', textAnchor: 'middle'},
      y: 5
    }, props.point.get('id'))
  ]);
}

var LL_ACC_TEXT = fs.readFileSync(path.join(__dirname,
  './lng-lat-accessor.js'), 'utf-8');

var KEY_ACC_TEXT = fs.readFileSync(path.join(__dirname,
  './key-accessor.js'), 'utf-8');

module.exports = React.createClass({
  getInitialState: function getInitialState() {
    return {
      map: {
        latitude: 37.79479838619875,
        longitude: -122.40476263042069,
        zoom: 13.2803194471232,
        mapStyle: stamenMapStyle,
        width: 700,
        height: 450,
        isDragging: false,
        startDragLngLat: null
      },
      draggablePoints: Immutable.fromJS(initialPoints)
    };
  },

  _onAddPoint: function _onAddPoint(_location) {
    var points = this.state.draggablePoints.push(new Immutable.Map({
      location: new Immutable.List(_location),
      id: ++pointIds
    }));
    this.setState({draggablePoints: points});
  },

  _onUpdatePoint: function _onUpdatePoint(opt) {
    var index = this.state.draggablePoints.findIndex(function filter(p) {
      return p.get('id') === opt.key;
    });
    var point = this.state.draggablePoints.get(index);
    point = point.set('location', new Immutable.List(opt.location));
    var points = this.state.draggablePoints.set(index, point);
    this.setState({draggablePoints: points});
  },

  _onChangeViewport: function _onChangeViewport(viewport) {
    console.log('on change viewport');
    this.setState({map: assign({}, this.state.map, viewport)});
  },

  render: function render() {
    return r.div([

      r.h1('Draggable Points Overlay'),

      r(CodeSnippet, {
        language: 'js',
        text: 'var ScatterPlotOverlay = require(\'react-map-gl/src/overlays' +
          '/scatterplot.react\');'
      }),

      r(Markdown, {
        text: 'This is a live example of the built in ' +
          '[`<DraggablePoints>`](https://github.com/uber/react-map-gl/blob/' +
          'master/src/overlays/draggable-points.react.js) overlay.'
      }),

      r(MapGL, assign({
        // onChangeViewport: this._onChangeViewport
      }, this.state.map), [
        r(DraggablePoints, assign({}, this.state.map, {
          points: this.state.draggablePoints,
          // onAddPoint: this._onAddPoint,
          onUpdatePoint: this._onUpdatePoint,
          renderPoint: function renderPoint(point) {
            return r.circle({r: 10})
            return FancyPoint({point: point});
          }
        }))
      ]),

      r(CodeSnippet, {
        language: 'html',
        text: '<MapGL {...viewport} mapStyle={mapStyle}>\n' +
          '    <DraggablePoints\n' +
          '      {...viewport}\n' +
          '      points={points}\n' +
          '      onUpdatePoint={this._updatePoint}\n' +
          '      renderPoint={point => r.circle({r: 10})}\n' +
          '    />\n' +
          '</MapGL>'
      }),

      r.h2('Props'),

      r.h4('points'),

      r(Markdown, {
        text: 'Expected to be an ' +
          '[ImmutableJS](https://facebook.github.io/immutable-js/) ' +
          '[List](https://facebook.github.io/immutable-js/docs/#/List) of ' +
          'locations.'
      }),

      r(CodeSnippet, {
        language: 'js',
        text: 'var points = Immutable.fromJS([\n' +
          '  {location:[-122.39508481737994, 37.79450507471435 ], id: 0},\n' +
          '  {location:[-122.39750244137034, 37.79227619464379 ], id: 1},\n' +
          '  {location:[-122.4013303460217,  37.789251178427776], id: 2},\n' +
          '  ...\n' +
          ']);'
      }),

      r.h4('lngLatAccessor'),

      r(Markdown, {
        text: 'Use the `lngLatAccessor` prop to provide the location in a ' +
          'custom format. It\'s called with each location as the first ' +
          'argument. Here\'s the default `lngLatAccessor`.'
      }),

      r(CodeSnippet, {language: 'js', text: LL_ACC_TEXT}),

      r.h4('keyAccessor'),

      r(Markdown, {
        text: 'The `keyAccessor` is what allows the ' +
          '`<DraggablePointsOverlay>` to uniquely identify each point. ' +
          'The default `keyAccessor` assumes each point has an `id` property.'
      }),

      r(CodeSnippet, {language: 'js', text: KEY_ACC_TEXT})
    ]);
  }
});