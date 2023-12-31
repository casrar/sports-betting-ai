import {Component, JSX} from 'solid-js';
import { Show } from 'solid-js';

interface ILoadingButtonProps {
  onClick: () => void;
  loadingWhen: boolean;
  children: any;
  disabled: boolean;
  Element: JSX.Element
}

export const LoadingButton: Component<ILoadingButtonProps> = (props: ILoadingButtonProps) => {
  return (
    <>
      <button
        onclick={() => props.onClick()}
        disabled={props.loadingWhen || props.disabled}
        class={`${props.loadingWhen || props.disabled ? 'bg-gray-800/10' : 'bg-gray-800'} max-2xl mt-10 p-4 border border-gray-500 rounded-lg shadow-2xl mb-4 
      hover:hover:${!props.disabled ? 'bg-gray-700/10' : 'bg-gray-700/90'} text-white`}
      >
        <span class="flex">
          <Show when={props.loadingWhen} keyed>
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </Show>
          {props.children}
        </span>
      </button>
    </>
  );
};
