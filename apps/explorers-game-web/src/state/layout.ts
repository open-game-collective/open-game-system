import { LayoutProps, LayoutPropsSchema } from '@explorers-club/schema';
import { atom, computed, listenKeys, onMount } from 'nanostores';
import { myConnectionEntityStore, worldStore } from '@state/world';

export const layoutPropsStore = atom<LayoutProps>(LayoutPropsSchema.parse({}));

/**
 * Keeps the layoutProps updated with latest from the connection entity
 */
onMount(layoutPropsStore, () => {
  const unsub = myConnectionEntityStore.subscribe((entity) => {
    if (!entity) {
      return;
    }

    const unsub = entity.subscribe((event) => {
      if (entity.layoutProps) {
        layoutPropsStore.set(entity.layoutProps);
      }
    });

    return unsub;
  });

  return unsub;
});

export const modalIsOpenStore = computed(
  layoutPropsStore,
  (layoutProps) => layoutProps.modal.open
);

export const menuIsOpenStore = computed(
  layoutPropsStore,
  (layoutProps) => layoutProps.menu.open
);