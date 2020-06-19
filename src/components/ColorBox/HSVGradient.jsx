/* eslint-disable react/jsx-props-no-spreading */
/**
 * Copyright (c) Mik BRY
 * mik@mikbry.com
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import * as CommonTypes from '../../helpers/commonTypes';
import useEventCallback from '../../helpers/useEventCallback';

const getRGB = _h => {
  let rgb;
  const h = _h / 360;
  let v = 255;
  let i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = 0;
  const q = Math.round(v * (1 - f));
  const t = Math.round(v * f);
  v = Math.round(v);
  i %= 6;
  if (i === 0) rgb = [v, t, p];
  else if (i === 1) rgb = [q, v, p];
  else if (i === 2) rgb = [p, v, t];
  else if (i === 3) rgb = [p, q, v];
  else if (i === 4) rgb = [t, p, v];
  else rgb = [v, p, q]; // if (i === 5)
  return rgb;
};

const StyledRoot = styled.div`
  position: absolute;
  width: inherit;
  height: inherit;
  background: ${props => `${props.cssRgb} none repeat scroll 0% 0%`};
  margin: 0;
  & .muicc-hsvgradient-s {
    position: absolute;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0) linear-gradient(to right, rgb(255, 255, 255), rgba(255, 255, 255, 0)) repeat scroll 0%
      0%;
  }
  & .muicc-hsvgradient-v {
    position: absolute;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0) linear-gradient(to top, rgb(0, 0, 0), rgba(0, 0, 0, 0)) repeat scroll 0% 0%;
  }
  & .muicc-hsvgradient-v {
    position: absolute;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0) linear-gradient(to top, rgb(0, 0, 0), rgba(0, 0, 0, 0)) repeat scroll 0% 0%;
  }
  & .muicc-hsvgradient-cursor {
    position: absolute;
    top: 0px;
    left: 0px;
    border: 1px solid #f0f0f0;
    box-shadow: rgba(0, 0, 0, 0.37) 0px 1px 4px 0px;
    transition: box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    border-radius: 4px;
    cursor: ${props => !props.pressed && 'pointer'};
    zindex: 100;
    transform: translate(-4px, -4px);
  }
  & .muicc-hsvgradient-cursor:hover {
    box-shadow: 0px 0px 0px 8px rgba(63, 81, 181, 0.16);
  }
  & .muicc-hsvgradient-cursor:focus {
    outline: none !important;
    box-shadow: 0px 0px 0px 8px rgba(63, 81, 181, 0.16);
  }
  & .muicc-hsvgradient-cursor:focus > div {
    // TODO
  }
  & .muicc-hsvgradient-cursor-c {
    width: 8px;
    height: 8px;
    border-radius: 4px;
    box-shadow: white 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
  }
`;

const HSVGradient = ({ className, color, onChange, ...props }) => {
  const latestColor = React.useRef(color);
  const [focus, onFocus] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  React.useEffect(() => {
    latestColor.current = color;
  });
  const box = React.useRef();
  const cursor = React.useRef();
  let cursorPos = { x: 0, y: 0 };
  const rgb = getRGB(color.hsv[0]);
  const cssRgb = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;

  const setPosition = (pos, f) => {
    cursorPos = pos;
    cursor.current.style.top = `${pos.y}px`;
    cursor.current.style.left = `${pos.x}px`;
    if (f) {
      cursor.current.focus();
    }
  };

  const initPosition = ref => {
    if (ref) {
      const { hsv } = color;
      cursorPos = {
        x: Math.round((hsv[1] / 100) * (ref.clientWidth - 1)),
        y: Math.round((1 - hsv[2] / 100) * (ref.clientHeight - 1)),
      };
      setPosition(cursorPos);
    }
  };

  initPosition(box.current);
  if (box.current) {
    box.current.style.background = `${cssRgb} none repeat scroll 0% 0%`;
  }

  const convertMousePosition = ({ x, y }, ref) => {
    const bounds = ref.getBoundingClientRect();
    const pos = { x: x - bounds.left, y: y - bounds.top };
    if (pos.x < 0) {
      pos.x = 0;
    }
    if (pos.y < 0) {
      pos.y = 0;
    }
    if (pos.x >= ref.clientWidth) {
      pos.x = ref.clientWidth - 1;
    }
    if (pos.y >= ref.clientHeight) {
      pos.y = ref.clientHeight - 1;
    }
    setPosition(pos, true);
    const s = (pos.x / (ref.clientWidth - 1)) * 100;
    const v = (1 - pos.y / (ref.clientHeight - 1)) * 100;
    const c = latestColor.current;
    onChange([c.hsv[0], s, v]);
  };

  React.useEffect(() => {
    const ref = box.current;
    initPosition(ref);
    const handleDown = event => {
      onFocus(true);
      setPressed(true);
      event.preventDefault();
    };
    const handleUp = event => {
      const xy = { x: event.pageX - window.scrollX, y: event.pageY - window.scrollY };
      convertMousePosition(xy, ref);
      setPressed(false);
      event.preventDefault();
    };
    const handleMove = event => {
      if (pressed || event.buttons) {
        const xy = { x: event.pageX - window.scrollX, y: event.pageY - window.scrollY };
        convertMousePosition(xy, ref);
        event.preventDefault();
      }
    };
    const handleTouch = event => {
      const xy = { x: event.touches[0].pageX - window.scrollX, y: event.touches[0].pageY - window.scrollY };
      convertMousePosition(xy, ref);
      event.preventDefault();
    };

    ref.addEventListener('mousedown', handleDown);
    ref.addEventListener('mouseup', handleUp);
    ref.addEventListener('mousemove', handleMove);
    ref.addEventListener('touchdown', handleDown);
    ref.addEventListener('touchup', handleUp);
    ref.addEventListener('touchmove', handleTouch);
    return () => {
      ref.removeEventListener('mousedown', handleDown);
      ref.removeEventListener('mouseup', handleUp);
      ref.removeEventListener('mousemove', handleMove);
      ref.removeEventListener('touchdown', handleDown);
      ref.removeEventListener('touchup', handleUp);
      ref.removeEventListener('touchmove', handleTouch);
    };
  }, []);
  const handleKey = useEventCallback(event => {
    if (!focus) return;
    let { x, y } = cursorPos;
    switch (event.key) {
      case 'ArrowRight':
        x += 1;
        break;
      case 'ArrowLeft':
        x -= 1;
        break;
      case 'ArrowDown':
        y += 1;
        break;
      case 'ArrowUp':
        y -= 1;
        break;
      case 'Tab':
        onFocus(false);
        return;
      default:
        return;
    }
    event.preventDefault();
    const bounds = box.current.getBoundingClientRect();
    convertMousePosition({ x: x + bounds.left, y: y + bounds.top }, box.current);
  });
  const handleFocus = useEventCallback(event => {
    onFocus(true);
    event.preventDefault();
  });
  const handleBlur = useEventCallback(event => {
    onFocus(false);
    event.preventDefault();
  });
  return (
    <div className={className}>
      <StyledRoot {...props} ref={box} cssRgb={cssRgb} data-testid="hsvgradient-color">
        <div className="muicc-hsvgradient-s">
          <div className="muicc-hsvgradient-v">
            <div
              ref={cursor}
              tabIndex="0"
              role="slider"
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={color.hsv[1]}
              pressed={`${pressed}`}
              data-testid="hsvgradient-cursor"
              className="muicc-hsvgradient-cursor"
              onKeyDown={handleKey}
              onFocus={handleFocus}
              onBlur={handleBlur}
            >
              <div className="muicc-hsvgradient-cursor-c" />
            </div>
          </div>
        </div>
      </StyledRoot>
    </div>
  );
};

HSVGradient.propTypes = {
  color: CommonTypes.color.isRequired,
  className: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default HSVGradient;
