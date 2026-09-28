/* Military Base 2.5D — 01-crates-data.js · crate drop tables, prices, weekly featured item */
'use strict';
const CRATE_TABLES = {
  standard: [['solar',3],['wind',2],['oil',2],['ironmine',2],['tree',2],['rock',2],['flowers',1],['flag',1],['cookie',1],['sandbags',1],['scouttower',1]],
  elite:    [['data',3],['steel',2],['refinery',2],['cookie',1],['logistics',2],['depot',2],['tankfac',2],['pillbox',2],['radar',1],['commandocamp',1],['heliport',1],['stealthlab',1]],
  premium:  [['industrial',3],['skyscraper',2],['afbase',2],['heavyarmory',1],['mechi',1],['zeppeldock',1],['pentagon',1],['fusion',1],['goldenTurbine',1]],
  golden:   [['goldenTurbine',2],['goldenCrane',1],['goldenBomb',1],['goldenMechStat',1]],
};
const CRATE_PRICES = {standard:10000, elite:1000000};
const PREMIUM_PRICE = 250000;
const WEEKLY = ['industrial','afbase','mechi','zeppeldock','pentagon','b2hangar'];
