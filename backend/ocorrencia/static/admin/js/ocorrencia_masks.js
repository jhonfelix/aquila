(function () {
    'use strict';

    function applyMasks() {
        if (typeof Inputmask === 'undefined') return;

        // Definições customizadas para direção cardinal
        var dmsDefinitions = {
            '5': { validator: '[0-5]', cardinality: 1 },
            'L': { validator: '[NSns]', cardinality: 1, casing: 'upper' },  // Latitude: N ou S
            'G': { validator: '[EWew]', cardinality: 1, casing: 'upper' },  // Longitude: E ou W
        };

        var masks = [
            // Coordenadas DMS  ex: 23:26:08-S
            {
                id: 'id_latitude',
                opts: { mask: '99:59:59-L', definitions: dmsDefinitions, placeholder: 'DD:MM:SS-_', showMaskOnHover: false }
            },
            {
                id: 'id_longitude',
                opts: { mask: '999:59:59-G', definitions: dmsDefinitions, placeholder: 'DDD:MM:SS-_', showMaskOnHover: false }
            },
            // Coordenadas decimais
            {
                id: 'id_latitude_decimal',
                opts: { alias: 'decimal', digits: 6, digitsOptional: true, allowMinus: true, placeholder: '0', showMaskOnHover: false }
            },
            {
                id: 'id_longitude_decimal',
                opts: { alias: 'decimal', digits: 6, digitsOptional: true, allowMinus: true, placeholder: '0', showMaskOnHover: false }
            },
            // Dados orbitais
            {
                id: 'id_apogeu',
                opts: { alias: 'decimal', digits: 2, digitsOptional: true, allowMinus: false, placeholder: '0', showMaskOnHover: false }
            },
            {
                id: 'id_perigeu',
                opts: { alias: 'decimal', digits: 2, digitsOptional: true, allowMinus: false, placeholder: '0', showMaskOnHover: false }
            },
            {
                id: 'id_inclinacao',
                opts: { alias: 'decimal', digits: 2, digitsOptional: true, allowMinus: false, min: 0, max: 360, placeholder: '0', showMaskOnHover: false }
            },
        ];

        masks.forEach(function (item) {
            var el = document.getElementById(item.id);
            if (el) {
                Inputmask(item.opts).mask(el);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', applyMasks);
})();
