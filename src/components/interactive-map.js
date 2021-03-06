import {PureComponent, createElement} from 'react';
import PropTypes from 'prop-types';
import autobind from '../utils/autobind';

import StaticMap from './static-map';
import MapControls from './map-controls';

const propTypes = {
  displayConstraints: PropTypes.object.isRequired
};

const defaultProps = {
  displayConstraints: {
    maxPitch: 60
  }
};

export default class InteractiveMap extends PureComponent {

  static supported() {
    return StaticMap.supported();
  }

  constructor(props) {
    super(props);
    autobind(this);
  }

  // TODO - Remove once Viewport alternative is good enough
  _getMap() {
    return this._map._getMap();
  }

  // Checks a displayConstraints object to see if the map should be displayed
  checkDisplayConstraints(props) {
    const capitalize = s => s[0].toUpperCase() + s.slice(1);

    const {displayConstraints} = props;
    for (const propName in props) {
      const capitalizedPropName = capitalize(propName);
      const minPropName = `min${capitalizedPropName}`;
      const maxPropName = `max${capitalizedPropName}`;

      if (minPropName in displayConstraints && props[propName] < displayConstraints[minPropName]) {
        return false;
      }
      if (maxPropName in displayConstraints && props[propName] > displayConstraints[maxPropName]) {
        return false;
      }
    }
    return true;
  }

  render() {
    const mapVisible = this.checkDisplayConstraints(this.props);
    const visibility = mapVisible ? 'visible' : 'hidden';

    return (
      createElement(MapControls, Object.assign({}, this.props, {
        key: 'map-controls',
        style: {position: 'relative'}
      }), [
        createElement(StaticMap, Object.assign({}, this.props, {
          key: 'map-static',
          style: {visibility, position: 'absolute', left: 0, top: 0},
          ref: map => {
            this._map = map;
          },
          children: null
        })),
        createElement('div', {
          key: 'map-overlays',
          // Same as static map's overlay container
          className: 'overlays',
          style: {position: 'absolute', left: 0, top: 0},
          children: this.props.children
        })
      ])
    );
  }
}

InteractiveMap.displayName = 'InteractiveMap';
InteractiveMap.propTypes = propTypes;
InteractiveMap.defaultProps = defaultProps;
