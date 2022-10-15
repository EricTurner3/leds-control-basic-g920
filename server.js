"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpressServer = void 0;
var dgram = require("dgram");
var express = require("express");
var g = require("./mylib");
var cors = require("cors");
var car_class_enum_1 = require("./common/enums/car-class-enum");
var default_values_1 = require("./common/constants/default-values");
// import {CarModel} from './common/models/car-model';
var device_status_enum_1 = require("./common/enums/device-status-enum");
var leds_display_1 = require("./common/leds-display");
var led_patterns_1 = require("./common/constants/led-patterns");
var leds_mode_enum_1 = require("./common/enums/leds-mode-enum");
// import {KeyMode} from './common/enums/key-mode-enum';
var socket_io_1 = require("socket.io");
var Store = require('electron-store');
var ExpressServer = /** @class */ (function () {
    function ExpressServer() {
        this.PORT = 30500;
        this.HOST = '127.0.0.1';
        this.deviceStatus = device_status_enum_1.DeviceStatus.Disconnected;
        this.isCalibration = false;
        this.currentLedsArray = led_patterns_1.DEFAULT_LEDS_STATE;
        this.ledsMode = leds_mode_enum_1.LedsMode.Fill;
        // public keyMode: KeyMode = KeyMode.None;
        this.isKeyControl = true;
        // public hideUsers = false;
        // public hideNews = false;
        // public hideParameters = false;
        this.hideColors = true;
        this.color = default_values_1.DEFAULT_COLOR;
        this.interval = default_values_1.INTERVAL;
        this.ledsValue = 0;
        this.maxPercent = 0;
        this.idlePercent = 0;
        this.START = default_values_1.START_COEF;
        this.END = default_values_1.END_COEF;
        // private : CarModel[] = [];
        this.telemetry = {};
        this.frameTime = 0;
        this.store = new Store();
        this.server = dgram.createSocket('udp4');
        this.app = express();
        this.initExpress();
        this.connect();
        this.connectDevice();
        this.loadStore();
    }
    ExpressServer.prototype.close = function () {
        g.disconnect();
        this.server.close();
        this.listen.close();
    };
    ExpressServer.prototype.disconnect = function () {
        g.disconnect();
        this.server.close();
    };
    ExpressServer.prototype.initExpress = function () {
        var _this = this;
        this.app.use(cors());
        this.app.use(express.json());
        this.app.get('/get-store', function (req, res) {
            res.send(_this.store.get());
        });
        this.app.get('/clear', function (req, res) {
            _this.store.clear();
            res.send(_this.store.get());
        });
        this.app.get('/set-start-coef', function (req, res) {
            _this.START = Number(req.query.value);
            // const carId = Number(req.query.carId);
            // this.setStartCoef(carId, this.START);
            _this.store.set(default_values_1.LEVEL + '.leds.START', _this.START);
            res.send({ startCoef: _this.START });
        });
        this.app.get('/set-end-coef', function (req, res) {
            _this.END = Number(req.query.value);
            // const carId = Number(req.query.carId);
            _this.store.set(default_values_1.LEVEL + '.leds.END', _this.END);
            res.send({ endCoef: _this.END });
        });
        // this.app.get('/change-leds-mode', (req, res) => {
        //   this.ledsMode = Number(req.query.value);
        //
        //   this.store.set('ledsMode', this.ledsMode);
        //
        //   res.send({ledsMode: this.ledsMode});
        // });
        // this.app.get('/users-visibility', (req, res) => {
        //   this.hideUsers = req.query.value === 'true';
        //
        //   this.store.set('UI.hideUsers', this.hideUsers);
        //
        //   res.send({hideUsers: this.hideUsers});
        // });
        //
        // this.app.get('/news-visibility', (req, res) => {
        //   this.hideNews = req.query.value === 'true';
        //
        //   this.store.set('UI.hideNews', this.hideNews);
        //
        //   res.send({hideNews: this.hideNews});
        // });
        this.app.get('/colors-visibility', function (req, res) {
            _this.hideColors = req.query.value === 'true';
            _this.store.set(default_values_1.LEVEL + '.UI.hideColors', _this.hideColors);
            res.send({ hideColors: _this.hideColors });
        });
        // this.app.get('/key-control', (req, res) => {
        //   this.isKeyControl = req.query.value === 'true';
        //
        //   this.store.set('UI.isKeyControl', this.isKeyControl);
        //
        //   res.send({isKeyControl: this.isKeyControl});
        // });
        // this.app.get('/parameters-visibility', (req, res) => {
        //   this.hideParameters = req.query.value === 'true';
        //
        //   this.store.set('UI.hideParameters', this.hideParameters);
        //
        //   res.send({hideParameters: this.hideParameters});
        // });
        this.app.get('/color', function (req, res) {
            _this.color = req.query.value;
            _this.store.set(default_values_1.LEVEL + '.UI.color', _this.color);
            res.send({ color: _this.color });
        });
        this.app.get('/set-coefs', function (req, res) {
            _this.START = Number(req.query.start);
            _this.END = Number(req.query.end);
            // const carId = Number(req.query.carId);
            _this.store.set(default_values_1.LEVEL + '.leds.START', _this.START);
            _this.store.set(default_values_1.LEVEL + '.leds.END', _this.END);
            res.send({ startCoef: _this.START, endCoef: _this.END });
        });
        this.app.get('/set-interval', function (req, res) {
            _this.interval = Number(req.query.value);
            _this.store.set(default_values_1.LEVEL + '.UI.interval', _this.interval);
            res.send({ interval: _this.interval });
        });
        // this.app.post('/add-car', (req, res) => {
        //   const START: number = this.store.get('leds.START');
        //   const END: number = this.store.get('leds.END');
        //
        //   const newCar: CarModel = req.body;
        //   newCar.start = START;
        //   newCar.end = END;
        //
        //   this..push(newCar);
        //   this.store.set('', this.);
        //
        //   res.send({: this., startCoef: START, endCoef: END});
        // });
        // this.app.get('/clear-', (req, res) => {
        //   const START: number = this.store.get('leds.START');
        //   const END: number = this.store.get('leds.END');
        //
        //   this. = [];
        //   this.store.set('', this.);
        //   res.send({: this., startCoef: START, endCoef: END});
        // });
        // this.app.get('/', (req, res) => {
        //   const : CarModel[] = this.store.get('');
        //   res.send({});
        // });
        this.app.get('/user-data', function (req, res) {
            res.send({
                startCoef: _this.START,
                endCoef: _this.END,
                // : this.,
                interval: _this.interval,
                // ledsMode: this.ledsMode,
                // hideUsers: this.hideUsers,
                // hideNews: this.hideNews,
                hideColors: _this.hideColors,
                // hideParameters: this.hideParameters,
                color: _this.color,
            });
        });
        this.app.get('/check-device', function (req, res) {
            res.send({ deviceStatus: _this.deviceStatus });
        });
        this.app.get('/reconnect', function (req, res) {
            _this.connectDevice();
            setTimeout(function () {
                res.send({ deviceStatus: _this.deviceStatus });
            }, 2000);
        });
        this.app.get('/get-common-coefs', function (req, res) {
            var START = _this.store.get(default_values_1.LEVEL + '.leds.START');
            var END = _this.store.get(default_values_1.LEVEL + '.leds.END');
            res.send({ startCoef: START, endCoef: END });
        });
        this.app.get('/connect', function (req, res) {
            _this.connect();
            res.send({ status: 'connected' });
        });
        this.app.get('/disconnect', function (req, res) {
            _this.disconnect();
            res.send({ status: 'disconnected' });
        });
        this.app.get('/calibration', function (req, res) {
            if (req.query.value === '1') {
                _this.isCalibration = true;
                _this.END = _this.START + 1;
            }
            else {
                _this.isCalibration = false;
            }
            res.send({ endCoef: _this.END, isCalibration: _this.isCalibration });
        });
        this.listen = this.app.listen(3000, function () {
            console.log('The application is listening on port 3000!');
        });
        this.io = new socket_io_1.Server(this.listen, {
            cors: {
                origin: '*',
            }
        });
        // this.io.on('connection', (client) => {
        //    client.on('test', () => {
        //     console.log('received test'); // not displayed
        //     this.io.emit('ok');
        //   });
        // });
    };
    ExpressServer.prototype.connect = function () {
        var _this = this;
        this.server.on('listening', function () {
            var address = _this.server.address();
            console.log('UDP Server listening on ' + address.address + ':' + address.port);
        });
        this.server.bind(this.PORT, this.HOST);
    };
    ExpressServer.prototype.connectDevice = function () {
        var _this = this;
        try {
            g.connect({ autocenter: false }, function (err) {
                _this.deviceStatus = device_status_enum_1.DeviceStatus.Connected;
                //
                // g.on('wheel-button_option', (val) => {
                //   console.log('isKeyControl', this.isKeyControl);
                //   if (this.isKeyControl && val) {
                //     switch (this.keyMode) {
                //       case KeyMode.None: {
                //         this.keyMode = KeyMode.Start;
                //         console.log(this.keyMode);
                //         break;
                //       }
                //       case KeyMode.Start: {
                //         this.keyMode = KeyMode.End;
                //         console.log(this.keyMode);
                //         break;
                //       }
                //       case KeyMode.End: {
                //         this.keyMode = KeyMode.None;
                //         console.log(this.keyMode);
                //         break;
                //       }
                //     }
                //     this.io.emit('option', this.keyMode);
                //   }
                // });
                //
                // g.on('wheel-button_plus', (val) => {
                //   if (val) {
                //     if (this.keyMode === KeyMode.Start) {
                //       this.io.emit('start-plus');
                //     } else if (this.keyMode === KeyMode.End) {
                //       this.io.emit('end-plus');
                //     }
                //   }
                // });
                //
                // g.on('wheel-button_minus', (val) => {
                //   if (val) {
                //     if (this.keyMode === KeyMode.Start) {
                //       this.io.emit('start-minus');
                //     } else if (this.keyMode === KeyMode.End) {
                //       this.io.emit('end-minus');
                //     }
                //   }
                // });
                _this.server.on('message', function (message, remote) {
                    _this.telemetry.isRaceOn = message.readInt32LE(0);
                    _this.telemetry.engineMaxRpm = message.readFloatLE(8); // first init data
                    _this.telemetry.engineIdleRpm = message.readFloatLE(12);
                    _this.telemetry.currentEngineRpm = message.readFloatLE(16);
                    _this.telemetry.carOrdinal = message.readInt32LE(212); //Unique ID of the car make/model
                    _this.telemetry.carClass = message.readInt32LE(216); //Between 0 (D -- worst ) and 7 (X class -- best ) inclusive
                    _this.telemetry.carPerformanceIndex = message.readInt32LE(220); //Between 100 (slowest car) and 999 (fastest car) inclusive
                    if (_this.telemetry.isRaceOn) {
                        _this.maxPercent = _this.telemetry.currentEngineRpm * 100 / _this.telemetry.engineMaxRpm;
                        _this.idlePercent = _this.telemetry.engineIdleRpm * 100 / _this.telemetry.engineMaxRpm;
                        _this.new_idle = (_this.telemetry.engineMaxRpm * _this.START) / 100;
                        _this.new_max = (_this.telemetry.engineMaxRpm * _this.END) / 100;
                        _this.LED = (_this.telemetry.currentEngineRpm - _this.new_idle) / (_this.new_max - _this.new_idle);
                        _this.ledsValue = _this.LED > 0 ? _this.LED : 0;
                        if (_this.isCalibration && _this.maxPercent > _this.END) {
                            _this.END = Math.round(_this.maxPercent);
                        }
                        _this.currentLedsArray = leds_display_1.ledsDisplay(_this.ledsValue, led_patterns_1.FILL_ARRAY);
                        g.leds(_this.currentLedsArray);
                        if (_this.interval === 0) {
                            _this.emitGeneral();
                            return;
                        }
                        _this.frameTime += 1;
                        if (_this.frameTime > _this.interval) {
                            _this.frameTime = 0;
                            _this.emitGeneral();
                        }
                    }
                    else {
                        if (_this.maxPercent !== 0) {
                            _this.maxPercent = 0;
                            _this.idlePercent = 0;
                            _this.new_idle = 0;
                            _this.new_max = 0;
                            _this.LED = 0;
                            _this.ledsValue = 0;
                            _this.currentLedsArray = led_patterns_1.DEFAULT_LEDS_STATE;
                            g.leds(_this.currentLedsArray);
                            _this.emitGeneral();
                        }
                    }
                });
            });
        }
        catch (err) {
            this.deviceStatus = device_status_enum_1.DeviceStatus.Disconnected;
        }
    };
    ExpressServer.prototype.emitGeneral = function () {
        this.io.emit('general', {
            rpm: {
                max: this.telemetry.engineMaxRpm,
                idle: this.telemetry.engineIdleRpm,
                current: this.telemetry.currentEngineRpm,
            },
            car: {
                carId: this.telemetry.carOrdinal,
                carClass: this.telemetry.carOrdinal ? ExpressServer.GetCarClass(this.telemetry.carClass) : null,
                carPerformanceIndex: this.telemetry.carPerformanceIndex,
            },
            leds: {
                currentLedsArray: this.currentLedsArray,
                maxPercent: this.maxPercent,
                endCoef: this.END,
                newIdle: this.new_idle,
                newMax: this.new_max,
                idlePercent: this.idlePercent
            },
        });
    };
    ExpressServer.GetCarClass = function (carClass) {
        switch (carClass) {
            case 0:
                return car_class_enum_1.CarClass.D;
            case 1:
                return car_class_enum_1.CarClass.C;
            case 2:
                return car_class_enum_1.CarClass.B;
            case 3:
                return car_class_enum_1.CarClass.A;
            case 4:
                return car_class_enum_1.CarClass.S1;
            case 5:
                return car_class_enum_1.CarClass.S2;
            case 6:
                return car_class_enum_1.CarClass.P;
            case 7:
                return car_class_enum_1.CarClass.X;
            default:
                return null;
        }
    };
    //
    // private setStartCoef(carId: number, startCoef: number) {
    //   if (carId) {
    //     this. = this..map(c => {
    //       if (c.carId === carId) {
    //         c.start = startCoef;
    //       }
    //       return c;
    //     });
    //     this.store.set('', this.);
    //   } else {
    //     this.store.set('leds.START', startCoef);
    //   }
    // }
    //
    // private setEndCoef(carId: number, endCoef: number) {
    //   if (carId) {
    //     this. = this..map(c => {
    //       if (c.carId === carId) {
    //         c.end = endCoef;
    //       }
    //       return c;
    //     });
    //     this.store.set('', this.);
    //   } else {
    //     this.store.set('leds.END', endCoef);
    //   }
    // }
    ExpressServer.prototype.loadStore = function () {
        // const interval: number = this.store.get('UI.interval');
        var START = this.store.get(default_values_1.LEVEL + '.leds.START');
        var END = this.store.get(default_values_1.LEVEL + '.leds.END');
        // const  = this.store.get('');
        // const ledsMode = this.store.get('ledsMode');
        // const isKeyControl = this.store.get('UI.isKeyControl');
        // const hideUsers = this.store.get('UI.hideUsers');
        // const hideNews = this.store.get('UI.hideNews');
        var hideColors = this.store.get(default_values_1.LEVEL + '.UI.hideColors');
        // const hideParameters = this.store.get('UI.hideParameters');
        var color = this.store.get(default_values_1.LEVEL + '.UI.color');
        //
        // if (!ledsMode) {
        //   this.store.set('ledsMode', this.ledsMode);
        // } else {
        //   this.ledsMode = ledsMode;
        // }
        // if (!) {
        //   this.store.set('', this.);
        // } else {
        //   this. = ;
        // }
        //
        // if (!interval) {
        //   this.store.set('UI.interval', this.interval);
        // } else {
        //   this.interval = interval;
        // }
        if (!START) {
            this.store.set(default_values_1.LEVEL + '.leds.START', this.START);
        }
        else {
            this.START = START;
        }
        if (!END) {
            this.store.set(default_values_1.LEVEL + '.leds.END', this.END);
        }
        else {
            this.END = END;
        }
        // if (hideUsers === undefined || hideUsers === null) {
        //   this.store.set('UI.hideUsers', this.hideUsers);
        // } else {
        //   this.hideUsers = hideUsers;
        // }
        //
        // if (hideNews === undefined || hideNews === null) {
        //   this.store.set('UI.hideNews', this.hideNews);
        // } else {
        //   this.hideNews = hideNews;
        // }
        if (hideColors === undefined || hideColors === null) {
            this.store.set(default_values_1.LEVEL + '.UI.hideColors', this.hideColors);
        }
        else {
            this.hideColors = hideColors;
        }
        // if (hideParameters === undefined || hideParameters === null) {
        //   this.store.set('UI.hideParameters', this.hideParameters);
        // } else {
        //   this.hideParameters = hideParameters;
        // }
        if (color === undefined || color === null) {
            this.store.set(default_values_1.LEVEL + '.UI.color', this.color);
        }
        else {
            this.color = color;
        }
        //
        // if (isKeyControl === undefined || isKeyControl === null) {
        //   this.store.set('UI.isKeyControl', this.isKeyControl);
        // } else {
        //   this.isKeyControl = isKeyControl;
        // }
    };
    return ExpressServer;
}());
exports.ExpressServer = ExpressServer;
//# sourceMappingURL=server.js.map