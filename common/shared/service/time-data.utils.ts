import os from 'node:os';

export const isSlocInvalid = (sloc: string) => {
    return sloc != undefined && /[^a-zA-Z0-9\-\/]/.test(sloc);
}

export const getIPAddress = () => {
    var interfaces = os.networkInterfaces();
    for (var devName in interfaces) {
        var iface: any = interfaces[devName];

        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
                return alias.address;
        }
    }
    return '0.0.0.0';
}