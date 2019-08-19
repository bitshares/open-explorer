'use strict';

require("./app/app.module.js");

require("./app/sections/layout/nav.module.js");
require("./app/sections/accounts/accounts.module.js");
require("./app/sections/assets/assets.module.js");
require("./app/sections/markets/markets.module.js");
require("./app/sections/committee_members/committee_members.module.js");
require("./app/sections/fees/fees.module.js");
require("./app/sections/objects/objects.module.js");
require("./app/sections/proxies/proxies.module.js");
require("./app/sections/search/search.module.js");
require("./app/sections/txs/txs.module.js");
require("./app/sections/voting/voting.module.js");
require("./app/sections/witnesses/witnesses.module.js");
require("./app/sections/workers/workers.module.js");
require("./app/sections/operations/operations.module.js");
require("./app/sections/blocks/blocks.module.js");
require("./app/chart/chart.module.js");
require("./app/core/app.config.js");
require("./app/core/app.utilities.js");

require("./app/core/service.network.js");
require("./app/core/service.market.js");
require("./app/core/service.asset.js");
require("./app/core/service.chart.js");
require("./app/core/service.account.js");
require("./app/core/service.governance.js");

require("./app/core/app.controller.js");
require("./app/core/config.route.js");
require("./app/core/i18n.js");
require("./app/sections/dashboard/dashboard.controller.js");
require("./app/sections/layout/header.controller.js");
require("./app/sections/layout/nav.directive.js");
require("./app/sections/accounts/accounts.controller.js");
require("./app/sections/assets/assets.controller.js");
require("./app/sections/markets/markets.controller.js");
require("./app/sections/committee_members/committee_members.controller.js");
require("./app/sections/fees/fees.controller.js");
require("./app/sections/objects/objects.controller.js");
require("./app/sections/proxies/proxies.controller.js");
require("./app/sections/search/search.controller.js");
require("./app/sections/txs/txs.controller.js");
require("./app/sections/voting/voting.controller.js");
require("./app/sections/witnesses/witnesses.controller.js");
require("./app/sections/workers/workers.controller.js");
require("./app/sections/operations/operations.controller.js");
require("./app/sections/blocks/blocks.controller.js");
require("./app/chart/echarts.controller.js");



