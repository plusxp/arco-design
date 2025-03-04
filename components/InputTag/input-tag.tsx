import React, {
  useContext,
  useState,
  useRef,
  useImperativeHandle,
  ElementRef,
  useEffect,
  useMemo,
} from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { ConfigContext } from '../ConfigProvider';
import Tag from '../Tag';
import useMergeValue from '../_util/hooks/useMergeValue';
import cs from '../_util/classNames';
import InputComponent from '../Input/input-element';
import IconHover from '../_class/icon-hover';
import IconClose from '../../icon/react-icon/IconClose';
import { isObject, isArray } from '../_util/is';
import getHotkeyHandler from '../_util/getHotkeyHandler';
import { Backspace } from '../_util/keycode';
import { pickTriggerPropsFromRest } from '../_util/constant';
import { ObjectValueType, InputTagProps } from './interface';
import useMergeProps from '../_util/hooks/useMergeProps';

const CSS_TRANSITION_DURATION = 300;

const keepFocus = (e) => {
  e.target.tagName !== 'INPUT' && e.preventDefault();
};

const formatValue = (value: (ObjectValueType | string)[]) => {
  if (!isArray(value)) {
    return [];
  }
  return value.map((item) => {
    return isObject(item)
      ? {
          ...item,
          label: 'label' in item ? item.label : item.value,
          value: item.value,
          closable: item.closable,
        }
      : {
          label: item,
          value: item,
        };
  });
};

type InputTagHandle = {
  focus: () => void;
  blur: () => void;
};

// Deal with the delay of recomputing input width
const useComputeAutoWidthDelay = (value: InputTagProps<any>['value']) => {
  const refDelay = useRef(0);
  const refPrevValueLength = useRef(value.length);

  useEffect(() => {
    refDelay.current =
      value.length === 0 && refPrevValueLength.current > 0 ? CSS_TRANSITION_DURATION : 0;
    refPrevValueLength.current = value.length;
  }, [value]);

  return refDelay;
};

const defaultProps: InputTagProps = {
  animation: true,
  validate: (inputValue, values) => inputValue && values.every((item) => item !== inputValue),
};

function InputTag(baseProps: InputTagProps<string | ObjectValueType>, ref) {
  const { getPrefixCls, size: ctxSize, componentConfig } = useContext(ConfigContext);
  const props = useMergeProps<InputTagProps>(baseProps, defaultProps, componentConfig?.InputTag);
  const {
    className,
    style,
    placeholder,
    error,
    disabled,
    readOnly,
    allowClear,
    autoFocus,
    labelInValue,
    disableInput,
    animation,
    icon,
    suffix,
    validate,
    renderTag,
    tagClassName,
    onInputChange,
    onKeyDown,
    onPaste,
    onChange,
    onFocus,
    onBlur,
    onPressEnter,
    onRemove,
    onClear,
    onClick,
  } = props;
  const prefixCls = getPrefixCls('input-tag');
  const size = 'size' in props ? props.size : ctxSize;

  const inputRef = useRef<ElementRef<typeof InputComponent>>();

  const [focused, setFocused] = useState(false);
  const [value, setValue] = useMergeValue<ObjectValueType[]>([], {
    defaultValue: 'defaultValue' in props ? formatValue(props.defaultValue) : undefined,
    value: 'value' in props ? formatValue(props.value) : undefined,
  });
  const [inputValue, setInputValue] = useMergeValue('', {
    value: props.inputValue,
  });
  const refDelay = useComputeAutoWidthDelay(value);

  const UsedTransitionGroup = useMemo(
    () => ({ children }) => {
      return animation ? (
        <TransitionGroup component="div" className={`${prefixCls}-inner`}>
          {children}
        </TransitionGroup>
      ) : (
        <div className={`${prefixCls}-inner`}>{children}</div>
      );
    },
    [prefixCls, animation]
  );

  useImperativeHandle<any, InputTagHandle>(
    ref,
    () => {
      return {
        blur: inputRef.current && inputRef.current.blur,
        focus: inputRef.current && inputRef.current.focus,
      };
    },
    []
  );

  const valueChangeHandler = (value: ObjectValueType[]) => {
    if (disabled || readOnly) {
      return;
    }
    if (!('value' in props)) {
      setValue(value);
    }

    onChange && onChange(labelInValue ? value : value.map((x) => x.value));
  };

  const tagCloseHandler = (itemValue: ObjectValueType, index: number, event) => {
    onRemove && onRemove(itemValue, index, event);
    valueChangeHandler([...value.slice(0, index), ...value.slice(index + 1)]);
  };

  const hotkeyHandler = getHotkeyHandler(
    new Map([
      [
        Backspace.code,
        (event) => {
          if (!event.target.value && value.length) {
            for (let index = value.length - 1; index >= 0; index--) {
              const itemValue = value[index];
              if (itemValue.closable !== false) {
                tagCloseHandler(itemValue, index, event);
                return;
              }
            }
          }
        },
      ],
    ])
  );

  const mergedRenderTag = (item: ObjectValueType, index: number) => {
    const { value: itemValue, label } = item;
    const closable = !readOnly && !disabled && item.closable !== false;
    const onClose = (event) => {
      tagCloseHandler(item, index, event);
    };

    if (renderTag) {
      return renderTag(
        {
          value: itemValue,
          label,
          closable,
          onClose,
        },
        index,
        value
      );
    }

    return (
      <Tag
        visible
        className={cs(`${prefixCls}-tag`, {
          [tagClassName]: tagClassName,
        })}
        closable={closable}
        closeIcon={icon && icon.removeIcon}
        onClose={onClose}
      >
        <span
          title={typeof label === 'string' ? label : undefined}
          className={`${prefixCls}-tag-content`}
        >
          {typeof label === 'string' ? label.replace(/\s/g, '\u00A0') : label}
        </span>
      </Tag>
    );
  };

  const clearIcon =
    allowClear && !disabled && value.length ? (
      <IconHover
        size={size}
        key="clearIcon"
        className={`${prefixCls}-clear-icon`}
        onClick={(e) => {
          e.stopPropagation();
          valueChangeHandler([]);
          if (!focused) {
            inputRef.current && inputRef.current.focus();
          }
          onClear && onClear();
        }}
        onMouseDown={keepFocus}
      >
        {(icon && icon.clearIcon) || <IconClose />}
      </IconHover>
    ) : null;

  const hasSuffix = !!(clearIcon || suffix);

  return (
    <div
      {...pickTriggerPropsFromRest(props)}
      style={style}
      className={cs(
        prefixCls,
        {
          [`${prefixCls}-size-${size}`]: size,
          [`${prefixCls}-disabled`]: disabled,
          [`${prefixCls}-error`]: error,
          [`${prefixCls}-focus`]: focused,
          [`${prefixCls}-readonly`]: readOnly,
          [`${prefixCls}-has-suffix`]: hasSuffix,
          [`${prefixCls}-has-placeholder`]: !value.length,
        },
        className
      )}
      onMouseDown={keepFocus}
      onClick={(e) => {
        !focused && inputRef.current && inputRef.current.focus();
        if (onClick) {
          onClick(e);
        }
      }}
    >
      <div className={`${prefixCls}-view`}>
        <UsedTransitionGroup>
          {value.map((x, i) => {
            // Check whether two tags have same value. If so, set different key for them to avoid only rendering one tag.
            const isRepeat = value.findIndex((item) => item.value === x.value) !== i;
            const eleTag = mergedRenderTag(x, i);
            return React.isValidElement(eleTag) ? (
              <CSSTransition
                key={typeof x.value === 'object' ? i : isRepeat ? `${x.value}-${i}` : x.value}
                timeout={CSS_TRANSITION_DURATION}
                classNames="zoomIn"
              >
                {eleTag}
              </CSSTransition>
            ) : (
              eleTag
            );
          })}
          <CSSTransition key="input" timeout={CSS_TRANSITION_DURATION} classNames="zoomIn">
            <InputComponent
              size={size}
              disabled={disabled || disableInput}
              readOnly={readOnly}
              ref={inputRef}
              autoFocus={autoFocus}
              placeholder={!value.length ? placeholder : ''}
              prefixCls={`${prefixCls}-input`}
              autoFitWidth={{
                delay: () => refDelay.current,
              }}
              onPressEnter={async (e) => {
                onPressEnter && onPressEnter(e);

                if (validate) {
                  const isPass = await validate(inputValue, value);
                  if (isPass) {
                    valueChangeHandler(value.concat({ value: inputValue, label: inputValue }));
                    setInputValue('');
                  }
                }
              }}
              onFocus={(e) => {
                if (!disabled && !readOnly) {
                  setFocused(true);
                  onFocus && onFocus(e);
                }
              }}
              onBlur={(e) => {
                setFocused(false);
                setInputValue('');
                onBlur && onBlur(e);
              }}
              value={inputValue}
              onValueChange={(v, e) => {
                setInputValue(v);
                // Only fire callback on user input to ensure parent component can get real input value on controlled mode.
                onInputChange && onInputChange(v, e);
              }}
              onKeyDown={(event) => {
                hotkeyHandler(event as any);
                onKeyDown && onKeyDown(event);
              }}
              onPaste={onPaste}
            />
          </CSSTransition>
        </UsedTransitionGroup>

        {hasSuffix && (
          <div className={`${prefixCls}-suffix`} onMouseDown={keepFocus}>
            {clearIcon}
            {suffix}
          </div>
        )}
      </div>
    </div>
  );
}

const InputTagRef = React.forwardRef<InputTagHandle, InputTagProps<any>>(InputTag);

InputTagRef.displayName = 'InputTag';

export default InputTagRef;

export { InputTagProps };
