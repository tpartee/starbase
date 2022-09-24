import { Stores } from "./gamevalues";

export class TradeValues {
  public ours: Stores = new Stores(null);
  public theirs: Stores = new Stores(null);
  public diff: Stores = new Stores(null);
  public their_sell_price: Stores = new Stores(null);
  public their_buy_price: Stores = new Stores(null);
  public our_trade_creds: number = 0;
  public their_trade_creds: number = 0;
  public diff_trade_creds: number = 0;
  public our_storage: number = 0;
  public their_storage: number = 0;
}