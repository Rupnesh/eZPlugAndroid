export const constString = {

    // API_URL_AUTH: "https://ezcharge-api.azurewebsites.net/api/SMS/",
    // API_URL: "https://ezcharge-api.azurewebsites.net/api/Station/",

    API_URL_PROD: "https://ezcharge-api.azurewebsites.net/api/", 
    API_URL: "https://ezcharge-api-dev.azurewebsites.net/api/", 

    PATH_SMS: "api/SMS/",
    PATH_USER: "api/User/",
    PATH_ACCOUNT: "api/Account/",
    PATH_SITE: "api/Site/",
    PATH_STATION: "api/Station/",
    PATH_TRANSACTION: "api/Transaction/",
    PATH_PAYMENT: "api/PaymentGateway/",
    PATH_VERSION: "api/Version/",
    PATH_WALLET: "api/Wallet/",
    
    SEND_OTP: "SendOTP",
    VERIFY_OTP: "VerifyOTPAndLogin",
    REFRESH_OTP: "RefreshToken",

    GET_STATIONBY_ID: "GetStationById",
    GET_STATIONBY_SITEID: "GetStationsBySiteId",
    GET_STATION_CONNECTOR_STATUS: "GetStationConnectorStatus",

    GET_ALL_SITES: "GetAllSites",
    GET_NEARBY_SITE: "NearBySites",

    TRANSACTION_ID: "TRANSACTION_ID",
    ORDER_ID: "ORDER_ID",
    STATION_DATA: "STATION_DATA",

    SEARCH_SITE: "GetSitesBySiteName",

    FAVOURITE_DATA: "GetFavouritesDataForUser",
    HISTORY_DATA: "GetHistoryDataForUser",
    ADD_FAVOURITE_DATA: "AddStationToFavourites",

    START_CHARGING: "StartChargingRequest",
    STOP_CHARGING: "StopChargingRequest",
    ENERGY_CONSUMED: "EnergyConsumedDetails",
    UNLOCK_PLUG_REQUEST: "UnlockPlugRequest",
    DOOR_STATUS_REQUEST: "DoorStatusRequest",
    CALCULATE_TRANSACTION_ESTIMATE: "CalculateTransactionEstimate",
    NOTIFY_CHARGING_DETAILS_REQUEST: "NotifyChargingDetailsRequest",

    PAYMENT_CREATE_ORDER: "CreateOrder",
    ORDER_STATUS: "OrderStatus",
    GENERATE_INVOICE: "GenerateInvoice",
    GET_PAYMENT_LINK: "GetPaymentLink",

    //User
    ADD_VEHICLE: "AddVehicle",
    UPDATE_VEHICLE: "UpdateVehicle",
    DELETE_VEHICLE: "DeleteVehicle",
    GET_ALL_ACTIVE_VEHICLES: "GetAllActiveVehicles",
    UPDATE_USER_DETAILS: "UpdateUserDetails",
    GET_USER_BY_ID: "GetUserById",
    GET_USER_TRANSACTIONS: "GetUserTransactions",
    REGISTER_USER_FOR_PUSH_NOTIFICATIONS: "RegisterUserForPushNotifications",
    GET_FAQ: "GetFAQs",
    GET_ACTIVE_TRANSACTION_FOR_USER: "GetActiveTransactionForUser",
    GET_INVOICE_DETAILS_FOR_TRANSACTION: "GetInvoiceDetailsForTransaction",
    STORE_APP_HASK_KEY: "StoreAppHashKey",

    //Wallet
    GET_WALLET_BALANCE: "GetWalletBalance",
    GET_WALLET_DETAILS: "GetWalletDetails",
    GET_RECHARGE_WALLET_ORDER_STATUS: "GetRechargeWalletOrderStatus/",
    RECHARGE_WALLET: "RechargeWallet",
    CHECK_MINIMUM_WALLET_BALANCE: "CheckMinimumWalletBalanceMaintained",
    MAKE_PAYMENT_USING_WALLET: "MakePaymentUsingWallet",
    
    //storage key
    TUTORIAL_COMPLETED: "TUTORIAL_COMPLETED",
    LOGIN_STATUS: "LOGIN_STATUS",
    OTP_SESSION: "OTP_SESSION",
    USER_LIST: "USER_LIST",
    USER_LOCATION: "USER_LOCATION",
    PRICING_DETAILS: "PRICING_DETAILS",
    ESTIMATED_DATA: "ESTIMATED_DATA",
    WALLET_BALANCE: "WALLET_BALANCE",
    MINIMUM_WALLET_BALANCE: "MINIMUM_WALLET_BALANCE",

    SITE_DETAILS: "SITE_DETAILS",
    STATION_DETAILS: "STATION_DETAILS",
    STATION_DETAILS_INFO: "STATION_DETAILS_INFO",
    STATION_DETAILS_DATA: "STATION_DETAILS_DATA",

    PLUGGEDIN_START_TIME: "PLUGGEDIN_START_TIME",
    PLUGGEDOUT_TIME: "PLUGGEDOUT_TIME",
    CHARGING_START_TIME: "CHARGING_START_TIME",
    SELECTED_CHARGING_OPTIONS: "SELECTED_CHARGING_OPTIONS",
    CHARGING_TRANSACTION_DATA: "CHARGING_TRANSACTION_DATA",

    PAYMENT_ORDER_DATA: "PAYMENT_ORDER_DATA",

    GET_LATEST_VERSION_APP: "GetLatestVersionForAppType",

    //Error message
    HTTP_RESPONSE_ERROR: "Something wrong, Check your network or contact the satation owner",
    HTTP_UNAUTHORIZED_ERROR: "Invalid authentication. Login again!",
    STATION_AVAILABILITY_MESSAGE: "Station unavailable, try another.",
    INTERNET_ERROR: "Network error...",

    USER_LANGUAGE: "USER_LANGUAGE",
    IS_CHARGING_ENABLED: "IS_CHARGING_ENABLED",
    STOP_CLICKED: "STOP_CLICKED"

    
}