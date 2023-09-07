export default function Receiver() {
  const context = cast.framework.CastReceiverContext.getInstance();
  const playerManager = context.getPlayerManager();

  context.start({
    disableIdleTimeout: true,
  });
  console.log('HELLO!', context, playerManager);
  //   function addToCart(e: SubmitEvent) {
  //     e.preventDefault();
  //     isCartOpen.set(true);
  //     addCartItem(item);
  //   }
  return <div>hi</div>;
}
