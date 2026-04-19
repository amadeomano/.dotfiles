import React, { type FocusEvent as FocusEventType } from 'react';
import { useTranslation } from 'react-i18next';
import * as RadixDialog from '@radix-ui/react-dialog';
import classnames from 'classnames';
import { type TFunction } from 'i18next';

import { useResponsive } from '@personio-web/responsive-tooling';

import { createSlots } from '@personio-web/design-system-utils';
import { useForkRef } from '@personio-web/design-system-hooks';
import {
  ActionBar,
  Actions,
} from '@personio-web/design-system-component-action-bar';
import type { AvatarProps } from '@personio-web/design-system-component-avatar';
import { Dialog } from '@personio-web/design-system-component-dialog';
import { useDialogContext } from '@personio-web/design-system-component-dialog-context';
import { usePageContext } from '@personio-web/design-system-component-page-context';
import type {
  EnhancedOption,
  PickerOption,
  PickerRootProps,
} from '@personio-web/design-system-component-picker-types';
import { Popover } from '@personio-web/design-system-component-popover';

import { Footer } from '../Footer';
import { useEnhanceOptions } from '../hooks';
import { Picker } from '../Picker';
import { ButtonTrigger, CustomTrigger, SearchTrigger } from '../Trigger';
import { getSelectedOptions } from '../utils';

import styles from './Root.module.scss';

const Wrapper = ({
  children,
  renderDialog = false,
  onOpenChange,
  title,
  ...props
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metadata: PickerRootProps['metadata'];
  children: React.ReactNode;
  title?: string;
  renderDialog?: boolean;
}) => {
  if (renderDialog) {
    return (
      <Dialog.Base {...props} size="large" className={styles.dialog}>
        {title ? (
          <RadixDialog.Title asChild className={styles.dialogTitle}>
            <h4>{title}</h4>
          </RadixDialog.Title>
        ) : null}
        {children}
      </Dialog.Base>
    );
  }
  return (
    <Popover {...props} onOpenChange={onOpenChange}>
      {children}
    </Popover>
  );
};

type TriggerProps = {
  slots: {
    buttonTrigger?: React.ReactElement;
    customTrigger?: React.ReactElement;
    searchTrigger?: React.ReactElement;
  };
  open: boolean;
  onClick?: (open: boolean) => void;
  size: PickerRootProps['size'];
  displayValue: string | undefined;
  avatar: Omit<AvatarProps, 'size'> | undefined;
  placeholder: string;
  searchPickerHeight: number;
};

const getTrigger = ({
  slots,
  open,
  onClick,
  size,
  displayValue,
  avatar,
  placeholder,
  searchPickerHeight,
}: TriggerProps) => {
  if (slots.buttonTrigger) {
    return React.cloneElement(slots.buttonTrigger, {
      avatar,
      placeholder,
      'aria-expanded': open,
      'data-state': open ? 'open' : 'closed',
      size: size,
      children: slots.buttonTrigger?.props.children ?? displayValue,
      onClick: onClick ?? slots.buttonTrigger.props.onClick,
    });
  }

  if (slots.customTrigger) {
    return React.cloneElement(slots.customTrigger, {
      placeholder,
      'aria-expanded': open,
      'data-state': open ? 'open' : 'closed',
      displayValue,
      size: size,
      children: slots.customTrigger?.props.children ?? displayValue,
      onClick: onClick ?? slots.customTrigger.props.onClick,
    });
  }

  if (slots.searchTrigger) {
    return (
      // Anchor for search trigger
      <div
        style={{ height: searchPickerHeight }}
        className={styles.searchPickerAnchor}
        /*
         * Nullify aria attributes injected by the
         * Popover Trigger to prevent accessibility errors
         */
        aria-haspopup={undefined}
        aria-expanded={undefined}
        aria-controls={undefined}
      />
    );
  }

  return null;
};

export const Root = ({
  children,
  popoverContentClassname,
  onInteractOutside,
  onEscapeKeyDown,
  defaultOpen,
  variant,
  metadata,
  disabled,
  size,
  keepSearchAfterSelect = false,
  side,
  width,
  preferFullScreenOnMobile = false,
  title,
}: PickerRootProps) => {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState<boolean>(defaultOpen || false);

  const dialogContext = useDialogContext();
  const pageContext = usePageContext();

  // slots
  const { slots } = createSlots(children, {
    searchTrigger: SearchTrigger,
    buttonTrigger: ButtonTrigger,
    customTrigger: CustomTrigger,
    content: Picker,
    footer: Footer,
  });

  const trigger =
    slots.searchTrigger ?? slots.buttonTrigger ?? slots.customTrigger;
  const {
    multiple,
    selected = '',
    options: rootOptions = [],
  } = slots.content?.props || {};

  /* Mobile full screen functionality */
  const { isMobile } = useResponsive();
  const isFullScreenOnMobile = isMobile && preferFullScreenOnMobile;
  const [internalSelected, setInternalSelected] = React.useState(selected);

  React.useEffect(() => {
    if (isFullScreenOnMobile) {
      setInternalSelected(selected);
    }
  }, [selected, isFullScreenOnMobile]);

  /* Options handling */
  const { options, getOption } = useEnhanceOptions(
    rootOptions,
    slots.content?.props.expandConfig,
  );

  // Search
  const [search, setSearch] = React.useState('');
  const listBoxId = React.useId();

  const searchPickerRef = React.useRef<HTMLDivElement>(null);
  const searchPickerSlotRef = (
    slots.searchTrigger as
      | { ref: React.MutableRefObject<HTMLDivElement> }
      | undefined
  )?.ref;
  const forkedSearchPickerRef = useForkRef([
    searchPickerRef,
    searchPickerSlotRef || null,
  ]);

  // Ensures the popover starts below the search picker.
  const [searchPickerHeight, setSearchPickerHeight] = React.useState<number>(0);
  React.useEffect(() => {
    if (searchPickerRef?.current) {
      setSearchPickerHeight(searchPickerRef.current.clientHeight);
    }
  }, [selected, open]);

  // Render
  const { t } = useTranslation('design-system', { keyPrefix: 'picker' });

  const { selectedOptions, displayValue, avatar } = React.useMemo(() => {
    const selectedOptions = getSelectedOptions(selected, getOption);
    if (slots.searchTrigger) {
      return { selectedOptions, displayValue: '', avatar: undefined };
    }

    const triggerValue = getTriggerValueProps({
      selectedOptions,
      t,
    });

    return { ...triggerValue, selectedOptions };
  }, [getOption, options, selected, slots.searchTrigger, t]);

  if (!trigger || !slots.content) {
    return null;
  }

  const placeholder =
    trigger?.props.placeholder ||
    (multiple ? t('search.placeholder.multi') : t('search.placeholder.single'));

  let pickerPopoverStyle = {};

  if (width) {
    pickerPopoverStyle = {
      '--DS-picker-root-width': `${width}px`,
    };
  }

  if (size === 'fullWidth') {
    pickerPopoverStyle = {
      '--DS-picker-root-width': `100%`,
    };
  }

  const ContentComponent = isFullScreenOnMobile ? 'div' : Popover.Content;

  return (
    <div
      ref={rootRef}
      className={classnames(styles.root, { [styles.disabled]: disabled })}
    >
      {slots.searchTrigger
        ? // Renders the search trigger outside the Popover to ensure
          // focus remains on the search input rather than the list box.
          React.cloneElement(slots.searchTrigger, {
            value: search,
            selectedOptions,
            totalSelected: Array.isArray(selected)
              ? selected.length
              : undefined,
            placeholder,
            ref: forkedSearchPickerRef,
            onClick: () => {
              if (!open) {
                setOpen(true);
              }
            },
            onChange: (newSearch: string) => {
              setSearch(newSearch);
              setOpen(true);
            },
            onClear: () => {
              slots.searchTrigger?.props.onClear?.();
              setOpen(true);
            },
            onRemoveOption: (option: PickerOption) => {
              slots.searchTrigger?.props.onRemoveOption?.(option);
              setOpen(true);
            },
            onRemoveOverflowOptions: (lastOptionIndex: number) => {
              slots.searchTrigger?.props.onRemoveOverflowOptions?.(
                lastOptionIndex,
              );
              setOpen(true);
            },
            onBlur: (e: FocusEventType<HTMLInputElement>) => {
              const popover = popoverRef.current;
              // contain focus to enable consequent searches when user selects options using the mouse
              if (
                popover?.isSameNode(e.relatedTarget) ||
                popover?.contains(e.relatedTarget)
              ) {
                e.target.focus();
              }
            },
            expanded: open,
            'data-state': open ? 'open' : 'closed',
            'aria-controls': listBoxId,
            variant,
            multiple,
          })
        : isFullScreenOnMobile
        ? getTrigger({
            slots: {
              // Purposely not using the search trigger here, as it's handled above
              buttonTrigger: slots.buttonTrigger,
              customTrigger: slots.customTrigger,
            },
            open,
            onClick: () => {
              if (!open) {
                setOpen(true);
              }
            },
            size,
            displayValue,
            avatar,
            placeholder,
            searchPickerHeight,
          })
        : null}
      <Wrapper
        open={open}
        onOpenChange={setOpen}
        metadata={metadata}
        renderDialog={isFullScreenOnMobile}
        title={title}
      >
        {!isFullScreenOnMobile && (
          <Popover.Trigger>
            {getTrigger({
              slots,
              open,
              size,
              displayValue,
              avatar,
              placeholder,
              searchPickerHeight,
            })}
          </Popover.Trigger>
        )}
        <ContentComponent
          ref={popoverRef}
          className={classnames(
            popoverContentClassname,
            styles.popover,
            styles.content,
            {
              [styles.mobileContent]: isFullScreenOnMobile,
            },
          )}
          {...(!isFullScreenOnMobile
            ? {
                align: 'start',
                container:
                  dialogContext?.dialogRef?.current ??
                  (pageContext?.type === 'modal'
                    ? pageContext?.pageRef?.current
                    : undefined),
                onOpenAutoFocus: (e) => {
                  e.preventDefault();
                },
                onInteractOutside: (e) => {
                  // Avoid closing the popover on interactions within the search trigger
                  if (
                    slots.searchTrigger &&
                    targetIsChildrenOf(e.target as HTMLElement, rootRef.current)
                  ) {
                    e.preventDefault();
                    return;
                  }

                  // Firefox - Avoid closing the popover on interactions with its own children
                  if (popoverRef.current?.contains(e.target as HTMLElement)) {
                    e.preventDefault();
                    return;
                  }

                  onInteractOutside &&
                    onInteractOutside(
                      e as unknown as FocusEvent | PointerEvent,
                    );
                },
                onEscapeKeyDown: () => {
                  // Reset search on escape key down
                  if (
                    slots.searchTrigger &&
                    search.length &&
                    !onEscapeKeyDown
                  ) {
                    setSearch('');
                  }
                  onEscapeKeyDown && onEscapeKeyDown();
                },
              }
            : {})}
        >
          {React.cloneElement(slots.content, {
            ...slots.content.props,
            style: pickerPopoverStyle,
            metadata,

            // Disable search config and pass controlled search props when trigger is <SearchTrigger />
            ...(slots.searchTrigger
              ? {
                  rootRef,
                  className: styles.occupyAvailableWidth,
                  id: listBoxId,
                  search,
                  searchConfig: {
                    enabled: false,
                    fuzzy: slots.searchTrigger.props.fuzzy,
                  },
                }
              : {}),

            // Use internal select state and hide selected options on search when in full screen mobile mode
            ...(isFullScreenOnMobile
              ? {
                  selected: internalSelected,
                  search: undefined,
                  isFullScreenOnMobile: true,
                  searchConfig: {
                    ...(slots.content.props?.searchConfig || {}),
                    enabled: slots.content.props?.searchConfig?.enabled ?? true,
                    hideSelectedOptions: true,
                    autoFocus: Boolean(slots.searchTrigger),
                  },
                }
              : {}),

            onChange: (newValue: string | string[]) => {
              if (isFullScreenOnMobile) {
                setInternalSelected(newValue);
              } else {
                slots.content?.props.onChange(newValue);
              }

              // Reset search on selection change
              if (slots.searchTrigger && !keepSearchAfterSelect) {
                setSearch('');
              }

              // Automatically closes the popover after making a selection in single-select mode.
              if (open && newValue && !slots.content?.props.multiple) {
                setOpen(false);
              }
            },

            children: slots.footer,
          })}
        </ContentComponent>
        {isFullScreenOnMobile && (
          <Dialog.Footer contentRef={rootRef}>
            <ActionBar>
              <Actions.Secondary onClick={() => setOpen(false)}>
                {t('cancel')}
              </Actions.Secondary>
              <Actions.Primary
                onClick={() => {
                  slots.content?.props.onChange(internalSelected);
                  setOpen(false);
                }}
              >
                {t('apply')}
              </Actions.Primary>
            </ActionBar>
          </Dialog.Footer>
        )}
      </Wrapper>
    </div>
  );
};
type GetTriggerValuePropsArgs = {
  selectedOptions: EnhancedOption[];
  t: TFunction<'design-system', 'picker'>;
};

function getTriggerValueProps({
  selectedOptions,
  t,
}: GetTriggerValuePropsArgs) {
  if (!selectedOptions.length) {
    return { displayValue: undefined };
  }

  if (selectedOptions.length > 2) {
    return {
      displayValue: `${selectedOptions.length} ${t(
        'selected.default-label.multi',
      )}`,
    };
  }

  const displayValue = selectedOptions
    .map((option) =>
      typeof option.label === 'string'
        ? option.label
        : option.label.props.label,
    )
    .join(', ');

  if (
    selectedOptions.length === 1 &&
    typeof selectedOptions[0].label !== 'string'
  ) {
    const avatar =
      'avatar' in selectedOptions[0].label.props
        ? selectedOptions[0].label.props.avatar
        : undefined;

    return { displayValue, avatar };
  }

  return { displayValue };
}

function targetIsChildrenOf(
  target: HTMLElement | null,
  element: HTMLDivElement | null,
): boolean {
  if (target === element) {
    return true;
  }

  let parentTargetElement = target?.parentElement;

  while (parentTargetElement) {
    if (parentTargetElement === element) {
      parentTargetElement = undefined;
      return true;
    }

    parentTargetElement = parentTargetElement.parentElement;
  }

  return false;
}
