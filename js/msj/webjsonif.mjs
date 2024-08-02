/* @license Copyright 2023 Lennart Borgman (lennart.borgman@gmail.com) All rights reserved. NOTJSON */
export const webJsonIf = Object.freeze( // NOTJSON
    {
        "version": "0.0.003",
        "fetchcustomclaims": {
            "wanted": {
                "idtoken": true,
                "prioritize": true
            },
            "post": ["idtoken"]
        },
        "userexists": {
            "wanted": {
                "idtoken": true,
                "email": true
            },
            "post": ["idtoken"],
            "answer": {
                "userExists": true
            }
        },
        "testfcm": {
            "wanted": {
                "fcmtoken": true,
                "msg": true
            },
            "post": ["fcmtoken", "msg"],
            "answer": {
                "sent": true
            }
        }
    }
); // NOTJSON