/* eslint-disable */
module.exports = {

    //HOME PAGE LAYOUT

        "homePageLayout": {
            "type": "APL",
            "version": "1.1",
            "settings": {
                "idleTimeout": 120000
            },
            "theme": "dark",
            "import": [
                {
                    "name": "alexa-layouts",
                    "version": "1.0.0"
                }
            ],
            "resources": [
                {
                    "description": "Stock color for the light theme",
                    "colors": {
                        "colorTextPrimary": "#151920"
                    }
                },
                {
                    "description": "Stock color for the dark theme",
                    "when": "${viewport.theme == 'dark'}",
                    "colors": {
                        "colorTextPrimary": "#f0f1ef"
                    }
                },
                {
                    "description": "Standard font sizes",
                    "dimensions": {
                        "textSizeBody": 48,
                        "textSizePrimary": 27,
                        "textSizeSecondary": 23,
                        "textSizeSecondaryHint": 25
                    }
                },
                {
                    "description": "Common spacing values",
                    "dimensions": {
                        "spacingThin": 6,
                        "spacingSmall": 12,
                        "spacingMedium": 24,
                        "spacingLarge": 48,
                        "spacingExtraLarge": 72
                    }
                },
                {
                    "description": "Common margins and padding",
                    "dimensions": {
                        "marginTop": 40,
                        "marginLeft": 60,
                        "marginRight": 60,
                        "marginBottom": 40
                    }
                }
            ],
            "styles": {
                "textStyleBase": {
                    "description": "Base font description; set color",
                    "values": [
                        {
                            "color": "@colorTextPrimary"
                        }
                    ]
                },
                "textStyleBase0": {
                    "description": "Thin version of basic font",
                    "extend": "textStyleBase",
                    "values": {
                        "fontWeight": "100"
                    }
                },
                "textStyleBase1": {
                    "description": "Light version of basic font",
                    "extend": "textStyleBase",
                    "values": {
                        "fontWeight": "300"
                    }
                },
                "mixinBody": {
                    "values": {
                        "fontSize": "@textSizeBody"
                    }
                },
                "mixinPrimary": {
                    "values": {
                        "fontSize": "@textSizePrimary"
                    }
                },
                "mixinSecondary": {
                    "values": {
                        "fontSize": "@textSizeSecondary"
                    }
                },
                "textStylePrimary": {
                    "extend": [
                        "textStyleBase1",
                        "mixinPrimary"
                    ]
                },
                "textStyleSecondary": {
                    "extend": [
                        "textStyleBase0",
                        "mixinSecondary"
                    ]
                },
                "textStyleBody": {
                    "extend": [
                        "textStyleBase1",
                        "mixinBody"
                    ]
                },
                "textStyleSecondaryHint": {
                    "values": {
                        "fontFamily": "Bookerly",
                        "fontStyle": "italic",
                        "fontSize": "@textSizeSecondaryHint",
                        "color": "@colorTextPrimary"
                    }
                }
            },
            "onMount": [
                {
                    "type": "Sequential",
                    "commands": [
                        {
                            "type": "Parallel",
                            "commands": "<COMPONENT_ON_MOUNT_COMMANDS>"
                        }
                    ],
                    "finally": "<DOCUMENT_ON_MOUNT_COMMAND>"
                }
            ],
            "graphics": {
                "parameterizedCircle": {
                    "type": "AVG",
                    "version": "1.0",
                    "height": 100,
                    "width": 100,
                    "items": {
                        "type": "path",
                        "fill": "red",
                        "stroke": "blue",
                        "strokeWidth": 4,
                        "pathData": "M 50 0 L 100 50 L 50 100 L 0 50 z"
                    }
                }
            },
            "commands": {
                "slideInFromRight": {
                    "parameters": [
                        "distance"
                    ],
                    "command": {
                        "type": "AnimateItem",
                        "easing": "ease-in-out",
                        "duration": 300,
                        "values": [
                            {
                                "property": "opacity",
                                "from": 0,
                                "to": 1
                            },
                            {
                                "property": "transformX",
                                "from": "${distance}",
                                "to": 0
                            }
                        ]
                    }
                }
            },
            "layouts": {},
            "mainTemplate": {
                "parameters": [
                    "payload"
                ],
                "items": [
                    {
                        "type": "Container",
                        "when": "${@viewportProfile == @hubRoundSmall}",
                        "height": "100vh",
                        "items": [
                            {
                                "type": "Image",
                                "width": "100vw",
                                "height": "100vh",
                                "paddingLeft": "575",
                                "source": "${payload.RCHomePageData.backgroundImage.sources[0].url}",
                                "scale": "best-fill",
                                "align": "right",
                                "overlayColor": "rgba(black,0.5)",
                                "position": "absolute"
                            },
                            {
                                "headerAttributionImage": "${payload.RCHomePageData.logoUrl}",
                                "type": "AlexaHeader"
                            },
                            {
                                "type": "Container",
                                "grow": 1,
                                "justifyContent": "${viewport.shape == 'round' ? 'center' : 'end'}",
                                "items": [
                                    {
                                        "type": "Text",
                                        "style": "textStyleBody",
                                        "paddingLeft": "@marginLeft",
                                        "paddingRight": "@marginRight",
                                        "textAlign": "${viewport.shape == 'round' ? 'center' : 'left'}",
                                        "text": "${payload.RCHomePageData.textContent.primaryText.text}",
                                        "fontWeight": "bold",
                                        "letterSpacing": "1",
                                        "left": "10",
                                        "bottom": "50"
                                    }
                                ]
                            },
                            {
                                "footerHint": "${payload.RCHomePageData.hintText}",
                                "type": "AlexaFooter",
                                "when": "${viewport.shape != 'round'}"
                            }
                        ]
                    },
                    {
                        "type": "Container",
                        "when": "${@viewportProfile == @hubLandscapeSmall}",
                        "height": "100vh",
                        "items": [
                            {
                                "type": "Image",
                                "width": "100vw",
                                "height": "100vh",
                                "source": "${payload.RCHomePageData.backgroundImage.sources[0].url}",
                                "scale": "fill",
                                "overlayColor": "rgba(black,0.5)",
                                "position": "absolute"
                            },
                            {
                                "headerAttributionImage": "${payload.RCHomePageData.logoUrl}",
                                "type": "AlexaHeader"
                            },
                            {
                                "type": "Container",
                                "grow": 1,
                                "justifyContent": "${viewport.shape == 'round' ? 'center' : 'end'}",
                                "items": [
                                    {
                                        "type": "Text",
                                        "style": "textStyleBody",
                                        "paddingLeft": "@marginLeft",
                                        "paddingRight": "@marginRight",
                                        "textAlign": "${viewport.shape == 'round' ? 'center' : 'left'}",
                                        "text": "${payload.RCHomePageData.textContent.primaryText.text}",
                                        "fontWeight": "bold"
                                    }
                                ]
                            },
                            {
                                "footerHint": "${payload.RCHomePageData.hintText}",
                                "type": "AlexaFooter",
                                "when": "${viewport.shape != 'round'}"
                            }
                        ]
                    },
                    {
                        "type": "Container",
                        "when": "${@viewportProfile == @hubLandscapeMedium}",
                        "height": "100vh",
                        "items": [
                            {
                                "type": "Image",
                                "width": "100vw",
                                "height": "100vh",
                                "source": "${payload.RCHomePageData.backgroundImage.sources[0].url}",
                                "scale": "best-fill",
                                "overlayColor": "rgba(black,0.5)",
                                "position": "absolute"
                            },
                            {
                                "headerAttributionImage": "${payload.RCHomePageData.logoUrl}",
                                "type": "AlexaHeader"
                            },
                            {
                                "type": "Container",
                                "grow": 1,
                                "justifyContent": "${viewport.shape == 'round' ? 'center' : 'end'}",
                                "items": [
                                    {
                                        "type": "Text",
                                        "style": "textStyleBody",
                                        "paddingLeft": "@marginLeft",
                                        "paddingRight": "@marginRight",
                                        "textAlign": "${viewport.shape == 'round' ? 'center' : 'left'}",
                                        "text": "${payload.RCHomePageData.textContent.primaryText.text}",
                                        "fontWeight": "bold"
                                    }
                                ]
                            },
                            {
                                "footerHint": "${payload.RCHomePageData.hintText}",
                                "type": "AlexaFooter",
                                "when": "${viewport.shape != 'round'}"
                            }
                        ]
                    },
                    {
                        "type": "Container",
                        "when": "${@viewportProfile == @hubLandscapeLarge}",
                        "height": "100vh",
                        "items": [
                            {
                                "type": "Image",
                                "width": "100vw",
                                "height": "100vh",
                                "source": "${payload.RCHomePageData.backgroundImage.sources[0].url}",
                                "scale": "best-fill",
                                "overlayColor": "rgba(black,0.5)",
                                "position": "absolute"
                            },
                            {
                                "headerAttributionImage": "${payload.RCHomePageData.logoUrl}",
                                "type": "AlexaHeader"
                            },
                            {
                                "type": "Container",
                                "grow": 1,
                                "justifyContent": "${viewport.shape == 'round' ? 'center' : 'end'}",
                                "items": [
                                    {
                                        "type": "Text",
                                        "style": "textStyleBody",
                                        "paddingLeft": "@marginLeft",
                                        "paddingRight": "@marginRight",
                                        "textAlign": "${viewport.shape == 'round' ? 'center' : 'left'}",
                                        "text": "${payload.RCHomePageData.textContent.primaryText.text}",
                                        "fontWeight": "bold"
                                    }
                                ]
                            },
                            {
                                "footerHint": "${payload.RCHomePageData.hintText}",
                                "type": "AlexaFooter",
                                "when": "${viewport.shape != 'round'}"
                            }
                        ]
                    },
                    {
                        "type": "Container",
                        "when": "${@viewportProfile == @tvLandscapeXLarge}",
                        "height": "100vh",
                        "items": [
                            {
                                "type": "Image",
                                "width": "100vw",
                                "height": "100vh",
                                "source": "${payload.RCHomePageData.backgroundImage.sources[0].url}",
                                "scale": "best-fill",
                                "overlayColor": "rgba(black,0.5)",
                                "position": "absolute"
                            },
                            {
                                "headerAttributionImage": "${payload.RCHomePageData.logoUrl}",
                                "type": "AlexaHeader"
                            },
                            {
                                "type": "Container",
                                "grow": 1,
                                "justifyContent": "${viewport.shape == 'round' ? 'center' : 'end'}",
                                "items": [
                                    {
                                        "type": "Text",
                                        "style": "textStyleBody",
                                        "paddingLeft": "@marginLeft",
                                        "paddingRight": "@marginRight",
                                        "textAlign": "${viewport.shape == 'round' ? 'center' : 'left'}",
                                        "text": "${payload.RCHomePageData.textContent.primaryText.text}",
                                        "fontWeight": "bold"
                                    }
                                ]
                            },
                            {
                                "footerHint": "${payload.RCHomePageData.hintText}",
                                "type": "AlexaFooter",
                                "when": "${viewport.shape != 'round'}"
                            }
                        ]
                    }
                ]
            }
        },

    //AUTHORISATION ERROR LAYOUT

    "authorisationErrorLayout": {
        "type": "APL",
        "version": "1.1",
        "settings": {
            "idleTimeout": 120000
        },
        "theme": "dark",
        "import": [{
            "name": "alexa-layouts",
            "version": "1.0.0"
        }],
        "resources": [{
            "description": "Common margins and padding",
            "dimensions": {
                "marginTop": 40,
                "marginLeft": 60,
                "marginRight": 60,
                "marginBottom": 40
            }
        }],
        "onMount": [{
            "type": "Sequential",
            "commands": [{
                "type": "Parallel",
                "commands": "<COMPONENT_ON_MOUNT_COMMANDS>"
            }],
            "finally": "<DOCUMENT_ON_MOUNT_COMMAND>"
        }],
        "graphics": {
            "parameterizedCircle": {
                "type": "AVG",
                "version": "1.0",
                "height": 100,
                "width": 100,
                "items": {
                    "type": "path",
                    "fill": "red",
                    "stroke": "blue",
                    "strokeWidth": 4,
                    "pathData": "M 50 0 L 100 50 L 50 100 L 0 50 z"
                }
            }
        },
        "commands": {
            "slideInFromRight": {
                "parameters": [
                    "distance"
                ],
                "command": {
                    "type": "AnimateItem",
                    "easing": "ease-in-out",
                    "duration": 300,
                    "values": [{
                            "property": "opacity",
                            "from": 0,
                            "to": 1
                        },
                        {
                            "property": "transformX",
                            "from": "${distance}",
                            "to": 0
                        }
                    ]
                }
            }
        },
        "layouts": {},
        "mainTemplate": {
            "parameters": [
                "payload"
            ],
            "items": [{
                    "type": "Container",
                    "when": "${@viewportProfile == @hubRoundSmall}",
                    "height": "100vh",
                    "items": [{
                            "type": "Image",
                            "width": "100vw",
                            "height": "100vh",
                            "paddingLeft": "600",
                            "source": "${payload.AuthorisationErrorPageData.backgroundImage.sources[0].url}",
                            "scale": "best-fill",
                            "align": "right",
                            "overlayColor": "rgba(black,0.5)",
                            "position": "absolute"
                        },
                        {
                            "type": "AlexaHeader",
                            "headerAttributionImage": "${payload.AuthorisationErrorPageData.logoUrl}"
                        },
                        {
                            "type": "Container",
                            "grow": 1,
                            "items": [{
                                    "type": "Text",
                                    "paddingLeft": "@marginLeft",
                                    "paddingRight": "@marginRight",
                                    "paddingBottom": "30",
                                    "textAlign": "center",
                                    "color": "#BC2031",
                                    "fontFamily": "avenir next condensed",
                                    "fontSize": "26",
                                    "text": "${payload.AuthorisationErrorPageData.textContent.primaryText.text}",
                                    "fontWeight": "bold"
                                },
                                {
                                    "type": "Text",
                                    "paddingLeft": "@marginLeft",
                                    "paddingRight": "@marginRight",
                                    "paddingBottom": "150",
                                    "textAlign": "center",
                                    "color": "#FFFFFF",
                                    "fontSize": "24",
                                    "text": "${payload.AuthorisationErrorPageData.textContent.secondaryText.text}"
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "Container",
                    "when": "${@viewportProfile == @hubLandscapeSmall}",
                    "height": "100vh",
                    "items": [{
                            "type": "Image",
                            "width": "100vw",
                            "height": "100vh",
                            "source": "${payload.AuthorisationErrorPageData.backgroundImage.sources[0].url}",
                            "scale": "best-fill",
                            "overlayColor": "rgba(black,0.5)",
                            "position": "absolute"
                        },
                        {
                            "type": "AlexaHeader",
                            "headerAttributionImage": "${payload.AuthorisationErrorPageData.logoUrl}"
                        },
                        {
                            "type": "Container",
                            "grow": 1,
                            "items": [{
                                    "type": "Text",
                                    "paddingLeft": "@marginLeft",
                                    "paddingRight": "@marginRight",
                                    "paddingBottom": "30",
                                    "textAlign": "left",
                                    "color": "#BC2031",
                                    "fontFamily": "avenir next condensed",
                                    "text": "${payload.AuthorisationErrorPageData.textContent.primaryText.text}",
                                    "fontWeight": "bold"
                                },
                                {
                                    "type": "Text",
                                    "paddingLeft": "@marginLeft",
                                    "paddingRight": "@marginRight",
                                    "paddingBottom": "300",
                                    "textAlign": "left",
                                    "color": "#FFFFFF",
                                    "fontSize": "30",
                                    "text": "${payload.AuthorisationErrorPageData.textContent.secondaryText.text}"
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "Container",
                    "when": "${@viewportProfile == @hubLandscapeMedium}",
                    "height": "100vh",
                    "items": [{
                            "type": "Image",
                            "width": "100vw",
                            "height": "100vh",
                            "source": "${payload.AuthorisationErrorPageData.backgroundImage.sources[0].url}",
                            "scale": "best-fill",
                            "overlayColor": "rgba(black,0.5)",
                            "position": "absolute"
                        },
                        {
                            "type": "AlexaHeader",
                            "headerAttributionImage": "${payload.AuthorisationErrorPageData.logoUrl}"
                        },
                        {
                            "type": "Container",
                            "grow": 1,
                            "items": [{
                                    "type": "Text",
                                    "style": "textStyleBody",
                                    "paddingLeft": "@marginLeft",
                                    "paddingRight": "@marginRight",
                                    "paddingBottom": "30",
                                    "textAlign": "left",
                                    "color": "#BC2031",
                                    "fontFamily": "avenir next condensed",
                                    "fontSize": "40",
                                    "text": "${payload.AuthorisationErrorPageData.textContent.primaryText.text}",
                                    "fontWeight": "bold"
                                },
                                {
                                    "type": "Text",
                                    "paddingLeft": "@marginLeft",
                                    "paddingRight": "@marginRight",
                                    "paddingBottom": "350",
                                    "textAlign": "left",
                                    "color": "#FFFFFF",
                                    "fontSize": "30",
                                    "text": "${payload.AuthorisationErrorPageData.textContent.secondaryText.text}"
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "Container",
                    "when": "${@viewportProfile == @hubLandscapeLarge}",
                    "height": "100vh",
                    "items": [{
                            "type": "Image",
                            "width": "100vw",
                            "height": "100vh",
                            "source": "${payload.AuthorisationErrorPageData.backgroundImage.sources[0].url}",
                            "scale": "best-fill",
                            "overlayColor": "rgba(black,0.5)",
                            "position": "absolute"
                        },
                        {
                            "type": "AlexaHeader",
                            "headerAttributionImage": "${payload.AuthorisationErrorPageData.logoUrl}"
                        },
                        {
                            "type": "Container",
                            "grow": 1,
                            "items": [{
                                    "type": "Text",
                                    "paddingLeft": "@marginLeft",
                                    "paddingRight": "@marginRight",
                                    "paddingBottom": "30",
                                    "textAlign": "left",
                                    "color": "#BC2031",
                                    "fontFamily": "avenir next condensed",
                                    "fontSize": "50",
                                    "text": "${payload.AuthorisationErrorPageData.textContent.primaryText.text}",
                                    "fontWeight": "bold"
                                },
                                {
                                    "type": "Text",
                                    "paddingLeft": "@marginLeft",
                                    "paddingRight": "@marginRight",
                                    "paddingBottom": "550",
                                    "textAlign": "left",
                                    "color": "#FFFFFF",
                                    "fontSize": "40",
                                    "text": "${payload.AuthorisationErrorPageData.textContent.secondaryText.text}"
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "Container",
                    "when": "${@viewportProfile == @tvLandscapeXLarge}",
                    "height": "100vh",
                    "items": [{
                            "type": "Image",
                            "width": "100vw",
                            "height": "100vh",
                            "source": "${payload.AuthorisationErrorPageData.backgroundImage.sources[0].url}",
                            "scale": "best-fill",
                            "overlayColor": "rgba(black,0.5)",
                            "position": "absolute"
                        },
                        {
                            "type": "AlexaHeader",
                            "headerAttributionImage": "${payload.AuthorisationErrorPageData.logoUrl}"
                        },
                        {
                            "type": "Container",
                            "grow": 1,
                            "items": [{
                                    "type": "Text",
                                    "paddingLeft": "@marginLeft",
                                    "paddingRight": "@marginRight",
                                    "paddingBottom": "30",
                                    "textAlign": "left",
                                    "color": "#BC2031",
                                    "fontFamily": "avenir next condensed",
                                    "fontSize": "40",
                                    "text": "${payload.AuthorisationErrorPageData.textContent.primaryText.text}",
                                    "fontWeight": "bold"
                                },
                                {
                                    "type": "Text",
                                    "paddingLeft": "@marginLeft",
                                    "paddingRight": "@marginRight",
                                    "paddingBottom": "300",
                                    "textAlign": "left",
                                    "color": "#FFFFFF",
                                    "fontSize": "30",
                                    "text": "${payload.AuthorisationErrorPageData.textContent.secondaryText.text}"
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    },

    //CREATE CHANNEL LAYOUT

    "createChannelLayout": {
        "type": "APL",
        "version": "1.1",
        "settings": {
            "idleTimeout": 120000
        },
        "theme": "dark",
        "import": [{
            "name": "alexa-layouts",
            "version": "1.0.0"
        }],
        "onMount": [{
            "type": "Sequential",
            "commands": [{
                "type": "Parallel",
                "commands": "<COMPONENT_ON_MOUNT_COMMANDS>"
            }],
            "finally": "<DOCUMENT_ON_MOUNT_COMMAND>"
        }],
        "graphics": {
            "parameterizedCircle": {
                "type": "AVG",
                "version": "1.0",
                "height": 100,
                "width": 100,
                "items": {
                    "type": "path",
                    "fill": "red",
                    "stroke": "blue",
                    "strokeWidth": 4,
                    "pathData": "M 50 0 L 100 50 L 50 100 L 0 50 z"
                }
            }
        },
        "commands": {
            "slideInFromRight": {
                "parameters": [
                    "distance"
                ],
                "command": {
                    "type": "AnimateItem",
                    "easing": "ease-in-out",
                    "duration": 300,
                    "values": [{
                            "property": "opacity",
                            "from": 0,
                            "to": 1
                        },
                        {
                            "property": "transformX",
                            "from": "${distance}",
                            "to": 0
                        }
                    ]
                }
            }
        },
        "layouts": {},
        "mainTemplate": {
            "parameters": [
                "payload"
            ],
            "items": [{
                    "type": "Container",
                    "when": "${@viewportProfile == @hubRoundSmall}",
                    "height": "100vh",
                    "items": [{
                            "type": "Image",
                            "width": "100vw",
                            "height": "100vh",
                            "source": "${payload.CreateChannelPageData.backgroundImage.sources[0].url}",
                            "scale": "best-fill",
                            "align": "center",
                            "overlayColor": "rgba(black,0.5)",
                            "position": "absolute"
                        },
                        {
                            "type": "AlexaHeader",
                            "headerAttributionImage": "${payload.CreateChannelPageData.logoUrl}"
                        },
                        {
                            "type": "Container",
                            "grow": 1,
                            "items": [{
                                    "type": "Text",
                                    "paddingLeft": "200",
                                    "paddingRight": "60",
                                    "textAlign": "center",
                                    "color": "#FFFFFF",
                                    "fontFamily": "avenir next condensed",
                                    "fontSize": "40",
                                    "text": "${payload.CreateChannelPageData.textContent.placeholder.text}"
                                },
                                {
                                    "type": "Text",
                                    "width": "275",
                                    "paddingTop": "10",
                                    "paddingBottom": "10",
                                    "textAlign": "center",
                                    "color": "#1d74f5",
                                    "fontFamily": "avenir next condensed",
                                    "fontSize": "40",
                                    "text": "${payload.CreateChannelPageData.textContent.channelname.text}",
                                    "fontWeight": "bold",
                                    "left": "180"
                                },
                                {
                                    "type": "Text",
                                    "paddingLeft": "200",
                                    "paddingTop": "10",
                                    "paddingRight": "60",
                                    "textAlign": "center",
                                    "color": "#FFFFFF",
                                    "fontFamily": "avenir next condensed",
                                    "fontSize": "40",
                                    "text": "${payload.CreateChannelPageData.textContent.successful.text}"
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "Container",
                    "when": "${@viewportProfile == @hubLandscapeSmall}",
                    "height": "100vh",
                    "items": [{
                            "type": "Image",
                            "width": "100vw",
                            "height": "100vh",
                            "source": "${payload.CreateChannelPageData.backgroundImage.sources[0].url}",
                            "scale": "best-fill",
                            "overlayColor": "rgba(black,0.5)",
                            "position": "absolute"
                        },
                        {
                            "type": "AlexaHeader",
                            "headerAttributionImage": "${payload.CreateChannelPageData.logoUrl}"
                        },
                        {
                            "type": "Container",
                            "grow": 1,
                            "items": [{
                                    "type": "Text",
                                    "paddingLeft": "0",
                                    "paddingTop": "40",
                                    "paddingRight": "200",
                                    "textAlign": "right",
                                    "color": "#FFFFFF",
                                    "fontFamily": "avenir next condensed",
                                    "fontSize": "40",
                                    "text": "${payload.CreateChannelPageData.textContent.placeholder.text}"
                                },
                                {
                                    "type": "Text",
                                    "width": "400",
                                    "paddingLeft": "0",
                                    "paddingTop": "20",
                                    "textAlign": "center",
                                    "color": "#1d74f5",
                                    "fontFamily": "avenir next condensed",
                                    "fontSize": "40",
                                    "text": "${payload.CreateChannelPageData.textContent.channelname.text}",
                                    "fontWeight": "bold",
                                    "left": "500"
                                },
                                {
                                    "type": "Text",
                                    "paddingLeft": "0",
                                    "paddingTop": "20",
                                    "paddingRight": "120",
                                    "textAlign": "right",
                                    "color": "#FFFFFF",
                                    "fontFamily": "avenir next condensed",
                                    "fontSize": "40",
                                    "text": "${payload.CreateChannelPageData.textContent.successful.text}"
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "Container",
                    "when": "${@viewportProfile == @hubLandscapeMedium}",
                    "height": "100vh",
                    "items": [{
                            "type": "Image",
                            "width": "100vw",
                            "height": "100vh",
                            "source": "${payload.CreateChannelPageData.backgroundImage.sources[0].url}",
                            "scale": "best-fill",
                            "overlayColor": "rgba(black,0.5)",
                            "position": "absolute"
                        },
                        {
                            "type": "AlexaHeader",
                            "headerAttributionImage": "${payload.CreateChannelPageData.logoUrl}"
                        },
                        {
                            "type": "Container",
                            "grow": 1,
                            "items": [{
                                    "type": "Text",
                                    "paddingLeft": "0",
                                    "paddingTop": "80",
                                    "paddingRight": "250",
                                    "textAlign": "right",
                                    "color": "#FFFFFF",
                                    "fontFamily": "avenir next condensed",
                                    "fontSize": "50",
                                    "text": "${payload.CreateChannelPageData.textContent.placeholder.text}"
                                },
                                {
                                    "type": "Text",
                                    "width": "400",
                                    "paddingLeft": "0",
                                    "paddingTop": "20",
                                    "textAlign": "center",
                                    "color": "#1d74f5",
                                    "fontFamily": "avenir next condensed",
                                    "fontSize": "50",
                                    "text": "${payload.CreateChannelPageData.textContent.channelname.text}",
                                    "fontWeight": "bold",
                                    "left": "500"
                                },
                                {
                                    "type": "Text",
                                    "paddingLeft": "0",
                                    "paddingTop": "20",
                                    "paddingRight": "140",
                                    "textAlign": "right",
                                    "color": "#FFFFFF",
                                    "fontFamily": "avenir next condensed",
                                    "fontSize": "50",
                                    "text": "${payload.CreateChannelPageData.textContent.successful.text}"
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "Container",
                    "when": "${@viewportProfile == @hubLandscapeLarge}",
                    "height": "100vh",
                    "items": [{
                            "type": "Image",
                            "width": "100vw",
                            "height": "100vh",
                            "paddingLeft": "1450",
                            "source": "${payload.CreateChannelPageData.backgroundImage.sources[0].url}",
                            "scale": "best-fill",
                            "overlayColor": "rgba(black,0.5)",
                            "position": "absolute"
                        },
                        {
                            "type": "AlexaHeader",
                            "headerAttributionImage": "${payload.CreateChannelPageData.logoUrl}"
                        },
                        {
                            "type": "Container",
                            "grow": 1,
                            "items": [{
                                    "type": "Text",
                                    "paddingLeft": "0",
                                    "paddingTop": "120",
                                    "paddingRight": "250",
                                    "textAlign": "right",
                                    "color": "#FFFFFF",
                                    "fontFamily": "avenir next condensed",
                                    "fontSize": "55",
                                    "text": "${payload.CreateChannelPageData.textContent.placeholder.text}"
                                },
                                {
                                    "type": "Text",
                                    "width": "600",
                                    "paddingTop": "20",
                                    "textAlign": "center",
                                    "color": "#1d74f5",
                                    "fontFamily": "avenir next condensed",
                                    "fontSize": "55",
                                    "text": "${payload.CreateChannelPageData.textContent.channelname.text}",
                                    "fontWeight": "bold",
                                    "left": "650"
                                },
                                {
                                    "type": "Text",
                                    "paddingLeft": "0",
                                    "paddingTop": "20",
                                    "paddingRight": "140",
                                    "textAlign": "right",
                                    "color": "#FFFFFF",
                                    "fontFamily": "avenir next condensed",
                                    "fontSize": "55",
                                    "text": "${payload.CreateChannelPageData.textContent.successful.text}"
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "Container",
                    "when": "${@viewportProfile == @tvLandscapeXLarge}",
                    "height": "100vh",
                    "items": [{
                            "type": "Image",
                            "width": "100vw",
                            "height": "100vh",
                            "source": "${payload.CreateChannelPageData.backgroundImage.sources[0].url}",
                            "scale": "best-fill",
                            "overlayColor": "rgba(black,0.5)",
                            "position": "absolute"
                        },
                        {
                            "type": "AlexaHeader",
                            "headerAttributionImage": "${payload.CreateChannelPageData.logoUrl}"
                        },
                        {
                            "type": "Container",
                            "grow": 1,
                            "items": [{
                                    "type": "Text",
                                    "paddingLeft": "0",
                                    "paddingTop": "50",
                                    "paddingRight": "200",
                                    "textAlign": "right",
                                    "color": "#FFFFFF",
                                    "fontFamily": "avenir next condensed",
                                    "fontSize": "50",
                                    "text": "${payload.CreateChannelPageData.textContent.placeholder.text}"
                                },
                                {
                                    "type": "Text",
                                    "width": "525",
                                    "paddingTop": "20",
                                    "textAlign": "center",
                                    "color": "#1d74f5",
                                    "fontFamily": "avenir next condensed",
                                    "fontSize": "50",
                                    "text": "${payload.CreateChannelPageData.textContent.channelname.text}",
                                    "fontWeight": "bold",
                                    "left": "425"
                                },
                                {
                                    "type": "Text",
                                    "paddingLeft": "0",
                                    "paddingTop": "20",
                                    "paddingRight": "110",
                                    "textAlign": "right",
                                    "color": "#FFFFFF",
                                    "fontFamily": "avenir next condensed",
                                    "fontSize": "50",
                                    "text": "${payload.CreateChannelPageData.textContent.successful.text}"
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    },

    // DELETE CHANNEL LAYOUT

    "deleteChannelLayout": {
        "type": "APL",
        "version": "1.1",
        "settings": {
            "idleTimeout": 120000
        },
        "theme": "dark",
        "import": [{
            "name": "alexa-layouts",
            "version": "1.0.0"
        }],
        "onMount": [{
            "type": "Sequential",
            "commands": [{
                "type": "Parallel",
                "commands": "<COMPONENT_ON_MOUNT_COMMANDS>"
            }],
            "finally": "<DOCUMENT_ON_MOUNT_COMMAND>"
        }],
        "graphics": {
            "parameterizedCircle": {
                "type": "AVG",
                "version": "1.0",
                "height": 100,
                "width": 100,
                "items": {
                    "type": "path",
                    "fill": "red",
                    "stroke": "blue",
                    "strokeWidth": 4,
                    "pathData": "M 50 0 L 100 50 L 50 100 L 0 50 z"
                }
            }
        },
        "commands": {
            "slideInFromRight": {
                "parameters": [
                    "distance"
                ],
                "command": {
                    "type": "AnimateItem",
                    "easing": "ease-in-out",
                    "duration": 300,
                    "values": [{
                            "property": "opacity",
                            "from": 0,
                            "to": 1
                        },
                        {
                            "property": "transformX",
                            "from": "${distance}",
                            "to": 0
                        }
                    ]
                }
            }
        },
        "layouts": {},
        "mainTemplate": {
            "parameters": [
                "payload"
            ],
            "items": [{
                    "type": "Container",
                    "when": "${@viewportProfile == @hubRoundSmall}",
                    "height": "100vh",
                    "items": [{
                            "type": "Image",
                            "width": "100vw",
                            "height": "100vh",
                            "source": "${payload.DeleteChannelPageData.backgroundImage.sources[0].url}",
                            "scale": "best-fill",
                            "align": "center",
                            "overlayColor": "rgba(black,0.5)",
                            "position": "absolute"
                        },
                        {
                            "type": "AlexaHeader",
                            "headerAttributionImage": "${payload.DeleteChannelPageData.logoUrl}"
                        },
                        {
                            "type": "Container",
                            "grow": 1,
                            "items": [{
                                    "type": "Text",
                                    "paddingLeft": "200",
                                    "paddingRight": "60",
                                    "textAlign": "center",
                                    "color": "#FFFFFF",
                                    "fontFamily": "avenir next condensed",
                                    "fontSize": "40",
                                    "text": "${payload.DeleteChannelPageData.textContent.placeholder.text}"
                                },
                                {
                                    "type": "Text",
                                    "width": "275",
                                    "paddingTop": "10",
                                    "paddingBottom": "10",
                                    "textAlign": "center",
                                    "color": "#1d74f5",
                                    "fontFamily": "avenir next condensed",
                                    "fontSize": "40",
                                    "text": "${payload.DeleteChannelPageData.textContent.channelname.text}",
                                    "fontWeight": "bold",
                                    "left": "180"
                                },
                                {
                                    "type": "Text",
                                    "paddingLeft": "200",
                                    "paddingTop": "10",
                                    "paddingRight": "60",
                                    "textAlign": "center",
                                    "color": "#FFFFFF",
                                    "fontFamily": "avenir next condensed",
                                    "fontSize": "40",
                                    "text": "${payload.DeleteChannelPageData.textContent.successful.text}"
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "Container",
                    "when": "${@viewportProfile == @hubLandscapeSmall}",
                    "height": "100vh",
                    "items": [{
                            "type": "Image",
                            "width": "100vw",
                            "height": "100vh",
                            "source": "${payload.DeleteChannelPageData.backgroundImage.sources[0].url}",
                            "scale": "best-fill",
                            "overlayColor": "rgba(black,0.5)",
                            "position": "absolute"
                        },
                        {
                            "type": "AlexaHeader",
                            "headerAttributionImage": "${payload.DeleteChannelPageData.logoUrl}"
                        },
                        {
                            "type": "Container",
                            "grow": 1,
                            "items": [{
                                    "type": "Text",
                                    "paddingLeft": "0",
                                    "paddingTop": "40",
                                    "paddingRight": "200",
                                    "textAlign": "right",
                                    "color": "#FFFFFF",
                                    "fontFamily": "avenir next condensed",
                                    "fontSize": "40",
                                    "text": "${payload.DeleteChannelPageData.textContent.placeholder.text}"
                                },
                                {
                                    "type": "Text",
                                    "width": "400",
                                    "paddingLeft": "0",
                                    "paddingTop": "20",
                                    "textAlign": "center",
                                    "color": "#1d74f5",
                                    "fontFamily": "avenir next condensed",
                                    "fontSize": "40",
                                    "text": "${payload.DeleteChannelPageData.textContent.channelname.text}",
                                    "fontWeight": "bold",
                                    "left": "500"
                                },
                                {
                                    "type": "Text",
                                    "paddingLeft": "0",
                                    "paddingTop": "20",
                                    "paddingRight": "120",
                                    "textAlign": "right",
                                    "color": "#FFFFFF",
                                    "fontFamily": "avenir next condensed",
                                    "fontSize": "40",
                                    "text": "${payload.DeleteChannelPageData.textContent.successful.text}"
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "Container",
                    "when": "${@viewportProfile == @hubLandscapeMedium}",
                    "height": "100vh",
                    "items": [{
                            "type": "Image",
                            "width": "100vw",
                            "height": "100vh",
                            "source": "${payload.DeleteChannelPageData.backgroundImage.sources[0].url}",
                            "scale": "best-fill",
                            "overlayColor": "rgba(black,0.5)",
                            "position": "absolute"
                        },
                        {
                            "type": "AlexaHeader",
                            "headerAttributionImage": "${payload.DeleteChannelPageData.logoUrl}"
                        },
                        {
                            "type": "Container",
                            "grow": 1,
                            "items": [{
                                    "type": "Text",
                                    "paddingLeft": "0",
                                    "paddingTop": "80",
                                    "paddingRight": "250",
                                    "textAlign": "right",
                                    "color": "#FFFFFF",
                                    "fontFamily": "avenir next condensed",
                                    "fontSize": "50",
                                    "text": "${payload.DeleteChannelPageData.textContent.placeholder.text}"
                                },
                                {
                                    "type": "Text",
                                    "width": "400",
                                    "paddingLeft": "0",
                                    "paddingTop": "20",
                                    "textAlign": "center",
                                    "color": "#1d74f5",
                                    "fontFamily": "avenir next condensed",
                                    "fontSize": "50",
                                    "text": "${payload.DeleteChannelPageData.textContent.channelname.text}",
                                    "fontWeight": "bold",
                                    "left": "500"
                                },
                                {
                                    "type": "Text",
                                    "paddingLeft": "0",
                                    "paddingTop": "20",
                                    "paddingRight": "140",
                                    "textAlign": "right",
                                    "color": "#FFFFFF",
                                    "fontFamily": "avenir next condensed",
                                    "fontSize": "50",
                                    "text": "${payload.DeleteChannelPageData.textContent.successful.text}"
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "Container",
                    "when": "${@viewportProfile == @hubLandscapeLarge}",
                    "height": "100vh",
                    "items": [{
                            "type": "Image",
                            "width": "100vw",
                            "height": "100vh",
                            "paddingLeft": "1450",
                            "source": "${payload.DeleteChannelPageData.backgroundImage.sources[0].url}",
                            "scale": "best-fill",
                            "overlayColor": "rgba(black,0.5)",
                            "position": "absolute"
                        },
                        {
                            "type": "AlexaHeader",
                            "headerAttributionImage": "${payload.DeleteChannelPageData.logoUrl}"
                        },
                        {
                            "type": "Container",
                            "grow": 1,
                            "items": [{
                                    "type": "Text",
                                    "paddingLeft": "0",
                                    "paddingTop": "120",
                                    "paddingRight": "250",
                                    "textAlign": "right",
                                    "color": "#FFFFFF",
                                    "fontFamily": "avenir next condensed",
                                    "fontSize": "55",
                                    "text": "${payload.DeleteChannelPageData.textContent.placeholder.text}"
                                },
                                {
                                    "type": "Text",
                                    "width": "600",
                                    "paddingTop": "20",
                                    "textAlign": "center",
                                    "color": "#1d74f5",
                                    "fontFamily": "avenir next condensed",
                                    "fontSize": "55",
                                    "text": "${payload.DeleteChannelPageData.textContent.channelname.text}",
                                    "fontWeight": "bold",
                                    "left": "650"
                                },
                                {
                                    "type": "Text",
                                    "paddingLeft": "0",
                                    "paddingTop": "20",
                                    "paddingRight": "140",
                                    "textAlign": "right",
                                    "color": "#FFFFFF",
                                    "fontFamily": "avenir next condensed",
                                    "fontSize": "55",
                                    "text": "${payload.DeleteChannelPageData.textContent.successful.text}"
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "Container",
                    "when": "${@viewportProfile == @tvLandscapeXLarge}",
                    "height": "100vh",
                    "items": [{
                            "type": "Image",
                            "width": "100vw",
                            "height": "100vh",
                            "source": "${payload.DeleteChannelPageData.backgroundImage.sources[0].url}",
                            "scale": "best-fill",
                            "overlayColor": "rgba(black,0.5)",
                            "position": "absolute"
                        },
                        {
                            "type": "AlexaHeader",
                            "headerAttributionImage": "${payload.DeleteChannelPageData.logoUrl}"
                        },
                        {
                            "type": "Container",
                            "grow": 1,
                            "items": [{
                                    "type": "Text",
                                    "paddingLeft": "0",
                                    "paddingTop": "50",
                                    "paddingRight": "200",
                                    "textAlign": "right",
                                    "color": "#FFFFFF",
                                    "fontFamily": "avenir next condensed",
                                    "fontSize": "50",
                                    "text": "${payload.DeleteChannelPageData.textContent.placeholder.text}"
                                },
                                {
                                    "type": "Text",
                                    "width": "525",
                                    "paddingTop": "20",
                                    "textAlign": "center",
                                    "color": "#1d74f5",
                                    "fontFamily": "avenir next condensed",
                                    "fontSize": "50",
                                    "text": "${payload.DeleteChannelPageData.textContent.channelname.text}",
                                    "fontWeight": "bold",
                                    "left": "425"
                                },
                                {
                                    "type": "Text",
                                    "paddingLeft": "0",
                                    "paddingTop": "20",
                                    "paddingRight": "110",
                                    "textAlign": "right",
                                    "color": "#FFFFFF",
                                    "fontFamily": "avenir next condensed",
                                    "fontSize": "50",
                                    "text": "${payload.DeleteChannelPageData.textContent.successful.text}"
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    },

    // POST MESSAGE LAYOUT

    "postMessageLayout": {
        "type": "APL",
        "version": "1.1",
        "settings": {
            "idleTimeout": 120000
        },
        "theme": "dark",
        "import": [{
            "name": "alexa-layouts",
            "version": "1.0.0"
        }],
        "onMount": [{
            "type": "Sequential",
            "commands": [{
                "type": "Parallel",
                "commands": "<COMPONENT_ON_MOUNT_COMMANDS>"
            }],
            "finally": "<DOCUMENT_ON_MOUNT_COMMAND>"
        }],
        "graphics": {
            "parameterizedCircle": {
                "type": "AVG",
                "version": "1.0",
                "height": 100,
                "width": 100,
                "items": {
                    "type": "path",
                    "fill": "red",
                    "stroke": "blue",
                    "strokeWidth": 4,
                    "pathData": "M 50 0 L 100 50 L 50 100 L 0 50 z"
                }
            }
        },
        "commands": {
            "slideInFromRight": {
                "parameters": [
                    "distance"
                ],
                "command": {
                    "type": "AnimateItem",
                    "easing": "ease-in-out",
                    "duration": 300,
                    "values": [{
                            "property": "opacity",
                            "from": 0,
                            "to": 1
                        },
                        {
                            "property": "transformX",
                            "from": "${distance}",
                            "to": 0
                        }
                    ]
                }
            }
        },
        "layouts": {},
        "mainTemplate": {
            "parameters": [
                "payload"
            ],
            "items": [{
                    "type": "Container",
                    "when": "${@viewportProfile == @hubRoundSmall}",
                    "height": "100vh",
                    "items": [{
                            "type": "Image",
                            "width": "100vw",
                            "height": "100vh",
                            "source": "${payload.PostMessageData.backgroundImage.sources[0].url}",
                            "scale": "best-fill",
                            "align": "center",
                            "overlayColor": "rgba(black,0.8)",
                            "position": "absolute"
                        },
                        {
                            "type": "AlexaHeader",
                            "headerAttributionImage": "${payload.PostMessageData.logoUrl}"
                        },
                        {
                            "type": "Container",
                            "grow": 1,
                            "items": [{
                                    "type": "Frame",
                                    "width": "80vw",
                                    "height": "7vh",
                                    "items": [{
                                        "type": "Text",
                                        "width": "75vw",
                                        "paddingLeft": "5",
                                        "paddingTop": "5",
                                        "textAlign": "left",
                                        "color": "#1d74f5",
                                        "fontFamily": "roboto",
                                        "fontSize": "17",
                                        "text": "Message Sent To ${payload.PostMessageData.textContent.channelname.text}",
                                        "fontWeight": "bold"
                                    }],
                                    "borderColor": "#A0A0A0",
                                    "borderWidth": "2",
                                    "left": "50"
                                },
                                {
                                    "type": "Frame",
                                    "width": "80vw",
                                    "height": "43vh",
                                    "items": [{
                                        "type": "ScrollView",
                                        "width": "78vw",
                                        "height": "40vh",
                                        "paddingLeft": "10",
                                        "paddingTop": "10",
                                        "item": [{
                                            "type": "Text",
                                            "textAlign": "left",
                                            "textAlignVertical": "center",
                                            "color": "#f2f3f5",
                                            "fontFamily": "monospace",
                                            "fontSize": "17",
                                            "text": "${payload.PostMessageData.textContent.message.text}"
                                        }]
                                    }],
                                    "borderColor": "#A0A0A0",
                                    "borderWidth": "2",
                                    "left": "50"
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "Container",
                    "when": "${@viewportProfile == @hubLandscapeSmall}",
                    "height": "100vh",
                    "items": [{
                            "type": "Image",
                            "width": "100vw",
                            "height": "100vh",
                            "source": "${payload.PostMessageData.backgroundImage.sources[0].url}",
                            "scale": "best-fill",
                            "overlayColor": "rgba(black,0.8)",
                            "position": "absolute"
                        },
                        {
                            "type": "AlexaHeader",
                            "headerAttributionImage": "${payload.PostMessageData.logoUrl}"
                        },
                        {
                            "type": "Container",
                            "grow": 1,
                            "items": [{
                                    "type": "Frame",
                                    "width": "55vw",
                                    "height": "10vh",
                                    "items": [{
                                        "type": "Text",
                                        "width": "55vw",
                                        "height": "10vh",
                                        "paddingLeft": "10",
                                        "paddingTop": "10",
                                        "textAlign": "left",
                                        "color": "#1d74f5",
                                        "fontFamily": "roboto",
                                        "fontSize": "20",
                                        "text": "Message Sent To ${payload.PostMessageData.textContent.channelname.text}",
                                        "fontWeight": "bold"
                                    }],
                                    "borderColor": "#A0A0A0",
                                    "borderWidth": "2",
                                    "left": "50"
                                },
                                {
                                    "type": "Frame",
                                    "width": "80vw",
                                    "height": "57vh",
                                    "items": [{
                                        "type": "ScrollView",
                                        "width": "78vw",
                                        "height": "55vh",
                                        "paddingLeft": "10",
                                        "paddingTop": "10",
                                        "item": [{
                                            "type": "Text",
                                            "textAlign": "left",
                                            "color": "#f2f3f5",
                                            "fontFamily": "monospace",
                                            "fontSize": "25",
                                            "text": "${payload.PostMessageData.textContent.message.text}"
                                        }]
                                    }],
                                    "borderColor": "#A0A0A0",
                                    "borderWidth": "2",
                                    "left": "50"
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "Container",
                    "when": "${@viewportProfile == @hubLandscapeMedium}",
                    "height": "100vh",
                    "items": [{
                            "type": "Image",
                            "width": "100vw",
                            "height": "100vh",
                            "source": "${payload.PostMessageData.backgroundImage.sources[0].url}",
                            "scale": "best-fill",
                            "overlayColor": "rgba(black,0.8)",
                            "position": "absolute"
                        },
                        {
                            "type": "AlexaHeader",
                            "headerAttributionImage": "${payload.PostMessageData.logoUrl}"
                        },
                        {
                            "type": "Container",
                            "grow": 1,
                            "items": [{
                                    "type": "Frame",
                                    "width": "55vw",
                                    "height": "10vh",
                                    "items": [{
                                        "type": "Text",
                                        "width": "55vw",
                                        "height": "10vh",
                                        "paddingLeft": "10",
                                        "paddingTop": "10",
                                        "textAlign": "left",
                                        "color": "#1d74f5",
                                        "fontFamily": "roboto",
                                        "fontSize": "25",
                                        "text": "Message Sent To ${payload.PostMessageData.textContent.channelname.text}",
                                        "fontWeight": "bold"
                                    }],
                                    "borderColor": "#A0A0A0",
                                    "borderWidth": "2",
                                    "left": "50"
                                },
                                {
                                    "type": "Frame",
                                    "width": "80vw",
                                    "height": "57vh",
                                    "items": [{
                                        "type": "ScrollView",
                                        "width": "78vw",
                                        "height": "55vh",
                                        "paddingLeft": "10",
                                        "paddingTop": "10",
                                        "item": [{
                                            "type": "Text",
                                            "textAlign": "left",
                                            "color": "#f2f3f5",
                                            "fontFamily": "monospace",
                                            "fontSize": "30",
                                            "text": "${payload.PostMessageData.textContent.message.text}"
                                        }]
                                    }],
                                    "borderColor": "#A0A0A0",
                                    "borderWidth": "2",
                                    "left": "50"
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "Container",
                    "when": "${@viewportProfile == @hubLandscapeLarge}",
                    "height": "100vh",
                    "items": [{
                            "type": "Image",
                            "width": "100vw",
                            "height": "100vh",
                            "paddingLeft": "1450",
                            "source": "${payload.PostMessageData.backgroundImage.sources[0].url}",
                            "scale": "best-fill",
                            "overlayColor": "rgba(black,0.8)",
                            "position": "absolute"
                        },
                        {
                            "type": "AlexaHeader",
                            "headerAttributionImage": "${payload.PostMessageData.logoUrl}"
                        },
                        {
                            "type": "Container",
                            "grow": 1,
                            "items": [{
                                    "type": "Frame",
                                    "width": "55vw",
                                    "height": "10vh",
                                    "items": [{
                                        "type": "Text",
                                        "width": "55vw",
                                        "height": "10vh",
                                        "paddingLeft": "10",
                                        "paddingTop": "10",
                                        "textAlign": "left",
                                        "color": "#1d74f5",
                                        "fontFamily": "roboto",
                                        "fontSize": "33",
                                        "text": "Message Sent To ${payload.PostMessageData.textContent.channelname.text}",
                                        "fontWeight": "bold"
                                    }],
                                    "borderColor": "#A0A0A0",
                                    "borderWidth": "2",
                                    "left": "50"
                                },
                                {
                                    "type": "Frame",
                                    "width": "80vw",
                                    "height": "57vh",
                                    "items": [{
                                        "type": "ScrollView",
                                        "width": "78vw",
                                        "height": "55vh",
                                        "paddingLeft": "10",
                                        "paddingTop": "10",
                                        "item": [{
                                            "type": "Text",
                                            "textAlign": "left",
                                            "color": "#f2f3f5",
                                            "fontFamily": "monospace",
                                            "fontSize": "35",
                                            "text": "${payload.PostMessageData.textContent.message.text}"
                                        }]
                                    }],
                                    "borderColor": "#A0A0A0",
                                    "borderWidth": "2",
                                    "left": "50"
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "Container",
                    "when": "${@viewportProfile == @tvLandscapeXLarge}",
                    "height": "100vh",
                    "items": [{
                            "type": "Image",
                            "width": "100vw",
                            "height": "100vh",
                            "source": "${payload.PostMessageData.backgroundImage.sources[0].url}",
                            "scale": "best-fill",
                            "overlayColor": "rgba(black,0.8)",
                            "position": "absolute"
                        },
                        {
                            "type": "AlexaHeader",
                            "headerAttributionImage": "${payload.PostMessageData.logoUrl}"
                        },
                        {
                            "type": "Container",
                            "grow": 1,
                            "items": [{
                                    "type": "Frame",
                                    "width": "55vw",
                                    "height": "10vh",
                                    "items": [{
                                        "type": "Text",
                                        "width": "55vw",
                                        "height": "10vh",
                                        "paddingLeft": "10",
                                        "paddingTop": "10",
                                        "textAlign": "left",
                                        "color": "#1d74f5",
                                        "fontFamily": "roboto",
                                        "fontSize": "23",
                                        "text": "Message Sent To ${payload.PostMessageData.textContent.channelname.text}",
                                        "fontWeight": "bold"
                                    }],
                                    "borderColor": "#A0A0A0",
                                    "borderWidth": "2",
                                    "left": "50"
                                },
                                {
                                    "type": "Frame",
                                    "width": "80vw",
                                    "height": "57vh",
                                    "items": [{
                                        "type": "ScrollView",
                                        "width": "78vw",
                                        "height": "55vh",
                                        "paddingLeft": "10",
                                        "paddingTop": "10",
                                        "item": [{
                                            "type": "Text",
                                            "textAlign": "left",
                                            "color": "#f2f3f5",
                                            "fontFamily": "monospace",
                                            "fontSize": "25",
                                            "text": "${payload.PostMessageData.textContent.message.text}"
                                        }]
                                    }],
                                    "borderColor": "#A0A0A0",
                                    "borderWidth": "2",
                                    "left": "50"
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    },

    // LAST MESSAGE TEXT LAYOUT

    "lastMessageLayout": {
        "type": "APL",
        "version": "1.1",
        "settings": {
            "idleTimeout": 120000
        },
        "theme": "dark",
        "import": [
            {
                "name": "alexa-layouts",
                "version": "1.0.0"
            }
        ],
        "resources": [
            {
                "description": "Common margins and padding",
                "dimensions": {
                    "marginTop": 40,
                    "marginLeft": 60,
                    "marginRight": 60,
                    "marginBottom": 40
                }
            }
        ],
        "onMount": [
            {
                "type": "Sequential",
                "commands": [
                    {
                        "type": "Parallel",
                        "commands": "<COMPONENT_ON_MOUNT_COMMANDS>"
                    }
                ],
                "finally": "<DOCUMENT_ON_MOUNT_COMMAND>"
            }
        ],
        "graphics": {
            "parameterizedCircle": {
                "type": "AVG",
                "version": "1.0",
                "height": 100,
                "width": 100,
                "items": {
                    "type": "path",
                    "fill": "red",
                    "stroke": "blue",
                    "strokeWidth": 4,
                    "pathData": "M 50 0 L 100 50 L 50 100 L 0 50 z"
                }
            }
        },
        "commands": {
            "slideInFromRight": {
                "parameters": [
                    "distance"
                ],
                "command": {
                    "type": "AnimateItem",
                    "easing": "ease-in-out",
                    "duration": 300,
                    "values": [
                        {
                            "property": "opacity",
                            "from": 0,
                            "to": 1
                        },
                        {
                            "property": "transformX",
                            "from": "${distance}",
                            "to": 0
                        }
                    ]
                }
            }
        },
        "layouts": {},
        "mainTemplate": {
            "parameters": [
                "payload"
            ],
            "items": [
                {
                    "type": "Container",
                    "when": "${@viewportProfile == @hubRoundSmall}",
                    "height": "100vh",
                    "items": [
                        {
                            "type": "Image",
                            "width": "100vw",
                            "height": "100vh",
                            "source": "${payload.lastMessageData.backgroundImage.sources[0].url}",
                            "scale": "best-fill",
                            "align": "center",
                            "overlayColor": "rgba(black,0.8)",
                            "position": "absolute"
                        },
                        {
                            "type": "AlexaHeader",
                            "headerAttributionImage": "${payload.lastMessageData.logoUrl}"
                        },
                        {
                            "type": "Container",
                            "grow": 1,
                            "items": [
                                {
                                    "type": "Frame",
                                    "width": "80vw",
                                    "height": "7vh",
                                    "items": [
                                        {
                                            "type": "Text",
                                            "width": "75vw",
                                            "paddingLeft": "5",
                                            "paddingTop": "5",
                                            "textAlign": "left",
                                            "color": "#1d74f5",
                                            "fontFamily": "roboto",
                                            "fontSize": "17",
                                            "text": "${payload.lastMessageData.textContent.username.text} says,",
                                            "fontWeight": "bold"
                                        }
                                    ],
                                    "borderColor": "#A0A0A0",
                                    "borderWidth": "2",
                                    "left": "50"
                                },
                                {
                                    "type": "Frame",
                                    "width": "80vw",
                                    "height": "43vh",
                                    "items": [
                                        {
                                            "type": "ScrollView",
                                            "width": "78vw",
                                            "height": "40vh",
                                            "paddingLeft": "10",
                                            "paddingTop": "10",
                                            "item": [
                                                {
                                                    "type": "Text",
                                                    "textAlign": "left",
                                                    "textAlignVertical": "center",
                                                    "color": "#f2f3f5",
                                                    "fontFamily": "monospace",
                                                    "fontSize": "17",
                                                    "text": "${payload.lastMessageData.textContent.message.text}"
                                                }
                                            ]
                                        }
                                    ],
                                    "borderColor": "#A0A0A0",
                                    "borderWidth": "2",
                                    "left": "50"
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "Container",
                    "when": "${@viewportProfile == @hubLandscapeSmall}",
                    "height": "100vh",
                    "items": [
                        {
                            "type": "Image",
                            "width": "100vw",
                            "height": "100vh",
                            "source": "${payload.lastMessageData.backgroundImage.sources[0].url}",
                            "scale": "best-fill",
                            "overlayColor": "rgba(black,0.8)",
                            "position": "absolute"
                        },
                        {
                            "type": "AlexaHeader",
                            "headerAttributionImage": "${payload.lastMessageData.logoUrl}"
                        },
                        {
                            "type": "Container",
                            "grow": 1,
                            "items": [
                                {
                                    "type": "Frame",
                                    "width": "55vw",
                                    "height": "10vh",
                                    "items": [
                                        {
                                            "type": "Text",
                                            "width": "55vw",
                                            "height": "10vh",
                                            "paddingLeft": "10",
                                            "paddingTop": "10",
                                            "textAlign": "left",
                                            "color": "#1d74f5",
                                            "fontFamily": "roboto",
                                            "fontSize": "20",
                                            "text": "${payload.lastMessageData.textContent.username.text} says,",
                                            "fontWeight": "bold"
                                        }
                                    ],
                                    "borderColor": "#A0A0A0",
                                    "borderWidth": "2",
                                    "left": "50"
                                },
                                {
                                    "type": "Frame",
                                    "width": "80vw",
                                    "height": "57vh",
                                    "items": [
                                        {
                                            "type": "ScrollView",
                                            "width": "78vw",
                                            "height": "55vh",
                                            "paddingLeft": "10",
                                            "paddingTop": "10",
                                            "item": [
                                                {
                                                    "type": "Text",
                                                    "textAlign": "left",
                                                    "color": "#f2f3f5",
                                                    "fontFamily": "monospace",
                                                    "fontSize": "25",
                                                    "text": "${payload.lastMessageData.textContent.message.text}"
                                                }
                                            ]
                                        }
                                    ],
                                    "borderColor": "#A0A0A0",
                                    "borderWidth": "2",
                                    "left": "50"
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "Container",
                    "when": "${@viewportProfile == @hubLandscapeMedium}",
                    "height": "100vh",
                    "items": [
                        {
                            "type": "Image",
                            "width": "100vw",
                            "height": "100vh",
                            "source": "${payload.lastMessageData.backgroundImage.sources[0].url}",
                            "scale": "best-fill",
                            "overlayColor": "rgba(black,0.8)",
                            "position": "absolute"
                        },
                        {
                            "type": "AlexaHeader",
                            "headerAttributionImage": "${payload.lastMessageData.logoUrl}"
                        },
                        {
                            "type": "Container",
                            "grow": 1,
                            "items": [
                                {
                                    "type": "Frame",
                                    "width": "55vw",
                                    "height": "10vh",
                                    "items": [
                                        {
                                            "type": "Text",
                                            "width": "55vw",
                                            "height": "10vh",
                                            "paddingLeft": "10",
                                            "paddingTop": "10",
                                            "textAlign": "left",
                                            "color": "#1d74f5",
                                            "fontFamily": "roboto",
                                            "fontSize": "25",
                                            "text": "${payload.lastMessageData.textContent.username.text} says,",
                                            "fontWeight": "bold"
                                        }
                                    ],
                                    "borderColor": "#A0A0A0",
                                    "borderWidth": "2",
                                    "left": "50"
                                },
                                {
                                    "type": "Frame",
                                    "width": "80vw",
                                    "height": "57vh",
                                    "items": [
                                        {
                                            "type": "ScrollView",
                                            "width": "78vw",
                                            "height": "55vh",
                                            "paddingLeft": "10",
                                            "paddingTop": "10",
                                            "item": [
                                                {
                                                    "type": "Text",
                                                    "textAlign": "left",
                                                    "color": "#f2f3f5",
                                                    "fontFamily": "monospace",
                                                    "fontSize": "30",
                                                    "text": "${payload.lastMessageData.textContent.message.text}"
                                                }
                                            ]
                                        }
                                    ],
                                    "borderColor": "#A0A0A0",
                                    "borderWidth": "2",
                                    "left": "50"
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "Container",
                    "when": "${@viewportProfile == @hubLandscapeLarge}",
                    "height": "100vh",
                    "items": [
                        {
                            "type": "Image",
                            "width": "100vw",
                            "height": "100vh",
                            "paddingLeft": "1450",
                            "source": "${payload.lastMessageData.backgroundImage.sources[0].url}",
                            "scale": "best-fill",
                            "overlayColor": "rgba(black,0.8)",
                            "position": "absolute"
                        },
                        {
                            "type": "AlexaHeader",
                            "headerAttributionImage": "${payload.lastMessageData.logoUrl}"
                        },
                        {
                            "type": "Container",
                            "grow": 1,
                            "items": [
                                {
                                    "type": "Frame",
                                    "width": "55vw",
                                    "height": "10vh",
                                    "items": [
                                        {
                                            "type": "Text",
                                            "width": "55vw",
                                            "height": "10vh",
                                            "paddingLeft": "10",
                                            "paddingTop": "10",
                                            "textAlign": "left",
                                            "color": "#1d74f5",
                                            "fontFamily": "roboto",
                                            "fontSize": "33",
                                            "text": "${payload.lastMessageData.textContent.username.text} says,",
                                            "fontWeight": "bold"
                                        }
                                    ],
                                    "borderColor": "#A0A0A0",
                                    "borderWidth": "2",
                                    "left": "50"
                                },
                                {
                                    "type": "Frame",
                                    "width": "80vw",
                                    "height": "57vh",
                                    "items": [
                                        {
                                            "type": "ScrollView",
                                            "width": "78vw",
                                            "height": "55vh",
                                            "paddingLeft": "10",
                                            "paddingTop": "10",
                                            "item": [
                                                {
                                                    "type": "Text",
                                                    "textAlign": "left",
                                                    "color": "#f2f3f5",
                                                    "fontFamily": "monospace",
                                                    "fontSize": "35",
                                                    "text": "${payload.lastMessageData.textContent.message.text}"
                                                }
                                            ]
                                        }
                                    ],
                                    "borderColor": "#A0A0A0",
                                    "borderWidth": "2",
                                    "left": "50"
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "Container",
                    "when": "${@viewportProfile == @tvLandscapeXLarge}",
                    "height": "100vh",
                    "items": [
                        {
                            "type": "Image",
                            "width": "100vw",
                            "height": "100vh",
                            "source": "${payload.lastMessageData.backgroundImage.sources[0].url}",
                            "scale": "best-fill",
                            "overlayColor": "rgba(black,0.8)",
                            "position": "absolute"
                        },
                        {
                            "type": "AlexaHeader",
                            "headerAttributionImage": "${payload.lastMessageData.logoUrl}"
                        },
                        {
                            "type": "Container",
                            "grow": 1,
                            "items": [
                                {
                                    "type": "Frame",
                                    "width": "55vw",
                                    "height": "10vh",
                                    "items": [
                                        {
                                            "type": "Text",
                                            "width": "55vw",
                                            "height": "10vh",
                                            "paddingLeft": "10",
                                            "paddingTop": "10",
                                            "textAlign": "left",
                                            "color": "#1d74f5",
                                            "fontFamily": "roboto",
                                            "fontSize": "23",
                                            "text": "${payload.lastMessageData.textContent.username.text} says,",
                                            "fontWeight": "bold"
                                        }
                                    ],
                                    "borderColor": "#A0A0A0",
                                    "borderWidth": "2",
                                    "left": "50"
                                },
                                {
                                    "type": "Frame",
                                    "width": "80vw",
                                    "height": "57vh",
                                    "items": [
                                        {
                                            "type": "ScrollView",
                                            "width": "78vw",
                                            "height": "55vh",
                                            "paddingLeft": "10",
                                            "paddingTop": "10",
                                            "item": [
                                                {
                                                    "type": "Text",
                                                    "textAlign": "left",
                                                    "color": "#f2f3f5",
                                                    "fontFamily": "monospace",
                                                    "fontSize": "25",
                                                    "text": "${payload.lastMessageData.textContent.message.text}"
                                                }
                                            ]
                                        }
                                    ],
                                    "borderColor": "#A0A0A0",
                                    "borderWidth": "2",
                                    "left": "50"
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    },

    // LAST MESSAGE IMAGE LAYOUT

        "lastMessageImageLayout": {
            "type": "APL",
            "version": "1.1",
            "settings": {
                "idleTimeout": 120000
            },
            "theme": "dark",
            "import": [
                {
                    "name": "alexa-layouts",
                    "version": "1.0.0"
                }
            ],
            "resources": [
                {
                    "description": "Common margins and padding",
                    "dimensions": {
                        "marginTop": 40,
                        "marginLeft": 60,
                        "marginRight": 60,
                        "marginBottom": 40
                    }
                }
            ],
            "onMount": [
                {
                    "type": "Sequential",
                    "commands": [
                        {
                            "type": "Parallel",
                            "commands": "<COMPONENT_ON_MOUNT_COMMANDS>"
                        }
                    ],
                    "finally": "<DOCUMENT_ON_MOUNT_COMMAND>"
                }
            ],
            "graphics": {
                "parameterizedCircle": {
                    "type": "AVG",
                    "version": "1.0",
                    "height": 100,
                    "width": 100,
                    "items": {
                        "type": "path",
                        "fill": "red",
                        "stroke": "blue",
                        "strokeWidth": 4,
                        "pathData": "M 50 0 L 100 50 L 50 100 L 0 50 z"
                    }
                }
            },
            "commands": {
                "slideInFromRight": {
                    "parameters": [
                        "distance"
                    ],
                    "command": {
                        "type": "AnimateItem",
                        "easing": "ease-in-out",
                        "duration": 300,
                        "values": [
                            {
                                "property": "opacity",
                                "from": 0,
                                "to": 1
                            },
                            {
                                "property": "transformX",
                                "from": "${distance}",
                                "to": 0
                            }
                        ]
                    }
                }
            },
            "layouts": {},
            "mainTemplate": {
                "parameters": [
                    "payload"
                ],
                "items": [
                    {
                        "type": "Container",
                        "when": "${@viewportProfile == @hubRoundSmall}",
                        "height": "100vh",
                        "items": [
                            {
                                "type": "Image",
                                "width": "100vw",
                                "height": "100vh",
                                "source": "${payload.lastMessageData.backgroundImage.sources[0].url}",
                                "scale": "best-fill",
                                "align": "center",
                                "overlayColor": "rgba(black,0.8)",
                                "position": "absolute"
                            },
                            {
                                "type": "AlexaHeader",
                                "headerAttributionImage": "${payload.lastMessageData.logoUrl}"
                            },
                            {
                                "type": "Container",
                                "grow": 1,
                                "items": [
                                    {
                                        "type": "Frame",
                                        "width": "80vw",
                                        "height": "7vh",
                                        "items": [
                                            {
                                                "type": "Text",
                                                "width": "75vw",
                                                "paddingLeft": "5",
                                                "paddingTop": "5",
                                                "textAlign": "left",
                                                "color": "#1d74f5",
                                                "fontFamily": "roboto",
                                                "fontSize": "17",
                                                "text": "From ${payload.lastMessageData.messageContent.username.text},",
                                                "fontWeight": "bold"
                                            }
                                        ],
                                        "borderColor": "#A0A0A0",
                                        "borderWidth": "2",
                                        "left": "50"
                                    },
                                    {
                                        "type": "Frame",
                                        "width": "80vw",
                                        "height": "43vh",
                                        "items": [
                                            {
                                                "type": "Image",
                                                "width": "79vw",
                                                "height": "42vh",
                                                "source": "${payload.lastMessageData.messageContent.image.url}"
                                            }
                                        ],
                                        "backgroundColor": "#040b1b",
                                        "borderColor": "#A0A0A0",
                                        "borderWidth": "2",
                                        "left": "50"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "type": "Container",
                        "when": "${@viewportProfile == @hubLandscapeSmall}",
                        "height": "100vh",
                        "items": [
                            {
                                "type": "Image",
                                "width": "100vw",
                                "height": "100vh",
                                "source": "${payload.lastMessageData.backgroundImage.sources[0].url}",
                                "scale": "best-fill",
                                "overlayColor": "rgba(black,0.8)",
                                "position": "absolute"
                            },
                            {
                                "type": "AlexaHeader",
                                "headerAttributionImage": "${payload.lastMessageData.logoUrl}"
                            },
                            {
                                "type": "Container",
                                "items": [
                                    {
                                        "type": "Frame",
                                        "width": "55vw",
                                        "height": "10vh",
                                        "items": [
                                            {
                                                "type": "Text",
                                                "width": "55vw",
                                                "height": "10vh",
                                                "paddingLeft": "10",
                                                "paddingTop": "10",
                                                "textAlign": "left",
                                                "color": "#1d74f5",
                                                "fontFamily": "roboto",
                                                "fontSize": "20",
                                                "text": "From ${payload.lastMessageData.messageContent.username.text},",
                                                "fontWeight": "bold"
                                            }
                                        ],
                                        "borderColor": "#A0A0A0",
                                        "borderWidth": "2",
                                        "left": "50"
                                    },
                                    {
                                        "type": "Frame",
                                        "width": "90vw",
                                        "height": "65vh",
                                        "items": [
                                            {
                                                "type": "Image",
                                                "width": "89vw",
                                                "height": "64vh",
                                                "source": "${payload.lastMessageData.messageContent.image.url}"
                                            }
                                        ],
                                        "backgroundColor": "#040b1b",
                                        "borderColor": "#A0A0A0",
                                        "borderWidth": "2",
                                        "left": "50"
                                    }
                                ],
                                "grow": 1
                            }
                        ]
                    },
                    {
                        "type": "Container",
                        "when": "${@viewportProfile == @hubLandscapeMedium}",
                        "height": "100vh",
                        "items": [
                            {
                                "type": "Image",
                                "width": "100vw",
                                "height": "100vh",
                                "source": "${payload.lastMessageData.backgroundImage.sources[0].url}",
                                "scale": "best-fill",
                                "overlayColor": "rgba(black,0.8)",
                                "position": "absolute"
                            },
                            {
                                "type": "AlexaHeader",
                                "headerAttributionImage": "${payload.lastMessageData.logoUrl}"
                            },
                            {
                                "type": "Container",
                                "grow": 1,
                                "items": [
                                    {
                                        "type": "Frame",
                                        "width": "55vw",
                                        "height": "10vh",
                                        "items": [
                                            {
                                                "type": "Text",
                                                "width": "55vw",
                                                "height": "10vh",
                                                "paddingLeft": "10",
                                                "paddingTop": "10",
                                                "textAlign": "left",
                                                "color": "#1d74f5",
                                                "fontFamily": "roboto",
                                                "fontSize": "25",
                                                "text": "From ${payload.lastMessageData.messageContent.username.text},",
                                                "fontWeight": "bold"
                                            }
                                        ],
                                        "borderColor": "#A0A0A0",
                                        "borderWidth": "2",
                                        "left": "50"
                                    },
                                    {
                                        "type": "Frame",
                                        "width": "90vw",
                                        "height": "65vh",
                                        "items": [
                                            {
                                                "type": "Image",
                                                "width": "89vw",
                                                "height": "64vh",
                                                "source": "${payload.lastMessageData.messageContent.image.url}"
                                            }
                                        ],
                                        "backgroundColor": "#040b1b",
                                        "borderColor": "#A0A0A0",
                                        "borderWidth": "2",
                                        "left": "50"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "type": "Container",
                        "when": "${@viewportProfile == @hubLandscapeLarge}",
                        "height": "100vh",
                        "items": [
                            {
                                "type": "Image",
                                "width": "100vw",
                                "height": "100vh",
                                "paddingLeft": "1450",
                                "source": "${payload.lastMessageData.backgroundImage.sources[0].url}",
                                "scale": "best-fill",
                                "overlayColor": "rgba(black,0.8)",
                                "position": "absolute"
                            },
                            {
                                "type": "AlexaHeader",
                                "headerAttributionImage": "${payload.lastMessageData.logoUrl}"
                            },
                            {
                                "type": "Container",
                                "grow": 1,
                                "items": [
                                    {
                                        "type": "Frame",
                                        "width": "55vw",
                                        "height": "10vh",
                                        "items": [
                                            {
                                                "type": "Text",
                                                "width": "55vw",
                                                "height": "10vh",
                                                "paddingLeft": "10",
                                                "paddingTop": "10",
                                                "textAlign": "left",
                                                "color": "#1d74f5",
                                                "fontFamily": "roboto",
                                                "fontSize": "33",
                                                "text": "From ${payload.lastMessageData.messageContent.username.text},",
                                                "fontWeight": "bold"
                                            }
                                        ],
                                        "borderColor": "#A0A0A0",
                                        "borderWidth": "2",
                                        "left": "50"
                                    },
                                    {
                                        "type": "Frame",
                                        "width": "90vw",
                                        "height": "65vh",
                                        "items": [
                                            {
                                                "type": "Image",
                                                "width": "89vw",
                                                "height": "64vh",
                                                "source": "${payload.lastMessageData.messageContent.image.url}"
                                            }
                                        ],
                                        "backgroundColor": "#040b1b",
                                        "borderColor": "#A0A0A0",
                                        "borderWidth": "2",
                                        "left": "50"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "type": "Container",
                        "when": "${@viewportProfile == @tvLandscapeXLarge}",
                        "height": "100vh",
                        "items": [
                            {
                                "type": "Image",
                                "width": "100vw",
                                "height": "100vh",
                                "source": "${payload.lastMessageData.backgroundImage.sources[0].url}",
                                "scale": "best-fill",
                                "overlayColor": "rgba(black,0.8)",
                                "position": "absolute"
                            },
                            {
                                "type": "AlexaHeader",
                                "headerAttributionImage": "${payload.lastMessageData.logoUrl}"
                            },
                            {
                                "type": "Container",
                                "grow": 1,
                                "items": [
                                    {
                                        "type": "Frame",
                                        "width": "55vw",
                                        "height": "10vh",
                                        "items": [
                                            {
                                                "type": "Text",
                                                "width": "55vw",
                                                "height": "10vh",
                                                "paddingLeft": "10",
                                                "paddingTop": "10",
                                                "textAlign": "left",
                                                "color": "#1d74f5",
                                                "fontFamily": "roboto",
                                                "fontSize": "23",
                                                "text": "From ${payload.lastMessageData.messageContent.username.text},",
                                                "fontWeight": "bold"
                                            }
                                        ],
                                        "borderColor": "#A0A0A0",
                                        "borderWidth": "2",
                                        "left": "50"
                                    },
                                    {
                                        "type": "Frame",
                                        "width": "90vw",
                                        "height": "65vh",
                                        "items": [
                                            {
                                                "type": "Image",
                                                "width": "89vw",
                                                "height": "64vh",
                                                "source": "${payload.lastMessageData.messageContent.image.url}"
                                            }
                                        ],
                                        "backgroundColor": "#040b1b",
                                        "borderColor": "#A0A0A0",
                                        "borderWidth": "2",
                                        "left": "50"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        },

    // LAST MESSAGE VIDEO LAYOUT

    "lastMessageVideoLayout": {
        "type": "APL",
        "version": "1.1",
        "settings": {
            "idleTimeout": 120000
        },
        "theme": "dark",
        "import": [
            {
                "name": "alexa-layouts",
                "version": "1.0.0"
            }
        ],
        "resources": [
            {
                "description": "Common margins and padding",
                "dimensions": {
                    "marginTop": 40,
                    "marginLeft": 60,
                    "marginRight": 60,
                    "marginBottom": 40
                }
            }
        ],
        "graphics": {
            "parameterizedCircle": {
                "type": "AVG",
                "version": "1.0",
                "height": 100,
                "width": 100,
                "items": {
                    "type": "path",
                    "fill": "red",
                    "stroke": "blue",
                    "strokeWidth": 4,
                    "pathData": "M 50 0 L 100 50 L 50 100 L 0 50 z"
                }
            }
        },
        "layouts": {},
        "mainTemplate": {
            "parameters": [
                "payload"
            ],
            "items": [
                {
                    "type": "Container",
                    "when": "${@viewportProfile == @hubRoundSmall}",
                    "height": "100vh",
                    "items": [
                        {
                            "type": "Image",
                            "width": "100vw",
                            "height": "100vh",
                            "source": "${payload.lastMessageData.backgroundImage.sources[0].url}",
                            "scale": "best-fill",
                            "align": "center",
                            "overlayColor": "rgba(black,0.8)",
                            "position": "absolute"
                        },
                        {
                            "type": "AlexaHeader",
                            "headerAttributionImage": "${payload.lastMessageData.logoUrl}"
                        },
                        {
                            "type": "Container",
                            "width": "80vw",
                            "height": "50vh",
                            "items": [
                                {
                                    "type": "Frame",
                                    "width": "80vw",
                                    "height": "7vh",
                                    "items": [
                                        {
                                            "type": "Text",
                                            "width": "75vw",
                                            "paddingLeft": "5",
                                            "paddingTop": "5",
                                            "textAlign": "left",
                                            "color": "#1d74f5",
                                            "fontFamily": "roboto",
                                            "fontSize": "17",
                                            "text": "From ${payload.lastMessageData.messageContent.username.text},",
                                            "fontWeight": "bold"
                                        }
                                    ],
                                    "borderColor": "#A0A0A0",
                                    "borderWidth": "2"
                                },
                                {
                                    "type": "Frame",
                                    "width": "80vw",
                                    "height": "43vh",
                                    "items": [
                                        {
                                            "type": "Video",
                                            "id": "VideoPlayer",
                                            "width": "79vw",
                                            "height": "42vh",
                                            "audioTrack": "foreground",
                                            "autoplay": true,
                                            "source": "${payload.lastMessageData.messageContent.video.url}",
                                            "onPause": [
                                                {
                                                    "type": "SetState",
                                                    "componentId": "alexaPlayPauseToggleButton",
                                                    "state": "checked",
                                                    "value": true
                                                }
                                            ],
                                            "onPlay": [
                                                {
                                                    "type": "SetState",
                                                    "componentId": "alexaPlayPauseToggleButton",
                                                    "state": "checked",
                                                    "value": false
                                                }
                                            ]
                                        }
                                    ],
                                    "backgroundColor": "#040b1b",
                                    "borderColor": "#A0A0A0",
                                    "borderWidth": "2"
                                }
                            ],
                            "grow": 1,
                            "alignSelf": "center"
                        },
                        {
                            "type": "Container",
                            "paddingBottom": "100",
                            "alignItems": "center",
                            "item": [
                                {
                                    "primaryControlSize": 50,
                                    "secondaryControlSize": 0,
                                    "mediaComponentId": "VideoPlayer",
                                    "type": "AlexaTransportControls"
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "Container",
                    "when": "${@viewportProfile == @hubLandscapeSmall}",
                    "height": "100vh",
                    "items": [
                        {
                            "type": "Image",
                            "width": "100vw",
                            "height": "100vh",
                            "source": "${payload.lastMessageData.backgroundImage.sources[0].url}",
                            "scale": "best-fill",
                            "overlayColor": "rgba(black,0.8)",
                            "position": "absolute"
                        },
                        {
                            "type": "AlexaHeader",
                            "headerAttributionImage": "${payload.lastMessageData.logoUrl}"
                        },
                        {
                            "type": "Container",
                            "items": [
                                {
                                    "type": "Frame",
                                    "width": "55vw",
                                    "height": "10vh",
                                    "items": [
                                        {
                                            "type": "Text",
                                            "width": "55vw",
                                            "height": "10vh",
                                            "paddingLeft": "10",
                                            "paddingTop": "10",
                                            "textAlign": "left",
                                            "color": "#1d74f5",
                                            "fontFamily": "roboto",
                                            "fontSize": "20",
                                            "text": "From ${payload.lastMessageData.messageContent.username.text},",
                                            "fontWeight": "bold"
                                        }
                                    ],
                                    "borderColor": "#A0A0A0",
                                    "borderWidth": "2",
                                    "left": "50"
                                },
                                {
                                    "type": "Frame",
                                    "width": "80vw",
                                    "height": "65vh",
                                    "items": [
                                        {
                                            "type": "Video",
                                            "id": "VideoPlayer",
                                            "width": "79vw",
                                            "height": "64vh",
                                            "audioTrack": "foreground",
                                            "autoplay": true,
                                            "source": "${payload.lastMessageData.messageContent.video.url}",
                                            "onPause": [
                                                {
                                                    "type": "SetState",
                                                    "componentId": "alexaPlayPauseToggleButton",
                                                    "state": "checked",
                                                    "value": true
                                                }
                                            ],
                                            "onPlay": [
                                                {
                                                    "type": "SetState",
                                                    "componentId": "alexaPlayPauseToggleButton",
                                                    "state": "checked",
                                                    "value": false
                                                }
                                            ]
                                        }
                                    ],
                                    "backgroundColor": "#040b1b",
                                    "borderColor": "#A0A0A0",
                                    "borderWidth": "2",
                                    "left": "50"
                                },
                                {
                                    "type": "Container",
                                    "width": "10vw",
                                    "height": "20vh",
                                    "alignItems": "center",
                                    "item": [
                                        {
                                            "primaryControlSize": 55,
                                            "secondaryControlSize": 0,
                                            "mediaComponentId": "VideoPlayer",
                                            "type": "AlexaTransportControls"
                                        }
                                    ],
                                    "alignSelf": "center",
                                    "left": "400",
                                    "top": "-200"
                                }
                            ],
                            "grow": 1
                        }
                    ]
                },
                {
                    "type": "Container",
                    "when": "${@viewportProfile == @hubLandscapeMedium}",
                    "height": "100vh",
                    "items": [
                        {
                            "type": "Image",
                            "width": "100vw",
                            "height": "100vh",
                            "source": "${payload.lastMessageData.backgroundImage.sources[0].url}",
                            "scale": "best-fill",
                            "overlayColor": "rgba(black,0.8)",
                            "position": "absolute"
                        },
                        {
                            "type": "AlexaHeader",
                            "headerAttributionImage": "${payload.lastMessageData.logoUrl}"
                        },
                        {
                            "type": "Container",
                            "items": [
                                {
                                    "type": "Frame",
                                    "width": "55vw",
                                    "height": "10vh",
                                    "items": [
                                        {
                                            "type": "Text",
                                            "width": "55vw",
                                            "height": "10vh",
                                            "paddingLeft": "10",
                                            "paddingTop": "10",
                                            "textAlign": "left",
                                            "color": "#1d74f5",
                                            "fontFamily": "roboto",
                                            "fontSize": "25",
                                            "text": "From ${payload.lastMessageData.messageContent.username.text},",
                                            "fontWeight": "bold"
                                        }
                                    ],
                                    "borderColor": "#A0A0A0",
                                    "borderWidth": "2",
                                    "left": "50"
                                },
                                {
                                    "type": "Frame",
                                    "width": "80vw",
                                    "height": "65vh",
                                    "items": [
                                        {
                                            "type": "Video",
                                            "id": "VideoPlayer",
                                            "width": "79vw",
                                            "height": "64vh",
                                            "audioTrack": "foreground",
                                            "autoplay": true,
                                            "source": "${payload.lastMessageData.messageContent.video.url}",
                                            "onPause": [
                                                {
                                                    "type": "SetState",
                                                    "componentId": "alexaPlayPauseToggleButton",
                                                    "state": "checked",
                                                    "value": true
                                                }
                                            ],
                                            "onPlay": [
                                                {
                                                    "type": "SetState",
                                                    "componentId": "alexaPlayPauseToggleButton",
                                                    "state": "checked",
                                                    "value": false
                                                }
                                            ]
                                        }
                                    ],
                                    "backgroundColor": "#040b1b",
                                    "borderColor": "#A0A0A0",
                                    "borderWidth": "2",
                                    "left": "50"
                                },
                                {
                                    "type": "Container",
                                    "width": "10vw",
                                    "height": "20vh",
                                    "alignItems": "center",
                                    "item": [
                                        {
                                            "primaryControlSize": 60,
                                            "secondaryControlSize": 0,
                                            "mediaComponentId": "VideoPlayer",
                                            "type": "AlexaTransportControls"
                                        }
                                    ],
                                    "alignSelf": "center",
                                    "left": "425",
                                    "top": "-250"
                                }
                            ],
                            "grow": 1
                        }
                    ]
                },
                {
                    "type": "Container",
                    "when": "${@viewportProfile == @hubLandscapeLarge}",
                    "height": "100vh",
                    "items": [
                        {
                            "type": "Image",
                            "width": "100vw",
                            "height": "100vh",
                            "paddingLeft": "1450",
                            "source": "${payload.lastMessageData.backgroundImage.sources[0].url}",
                            "scale": "best-fill",
                            "overlayColor": "rgba(black,0.8)",
                            "position": "absolute"
                        },
                        {
                            "type": "AlexaHeader",
                            "headerAttributionImage": "${payload.lastMessageData.logoUrl}"
                        },
                        {
                            "type": "Container",
                            "items": [
                                {
                                    "type": "Frame",
                                    "width": "55vw",
                                    "height": "10vh",
                                    "items": [
                                        {
                                            "type": "Text",
                                            "width": "55vw",
                                            "height": "10vh",
                                            "paddingLeft": "10",
                                            "paddingTop": "10",
                                            "textAlign": "left",
                                            "color": "#1d74f5",
                                            "fontFamily": "roboto",
                                            "fontSize": "33",
                                            "text": "From ${payload.lastMessageData.messageContent.username.text},",
                                            "fontWeight": "bold"
                                        }
                                    ],
                                    "borderColor": "#A0A0A0",
                                    "borderWidth": "2",
                                    "left": "50"
                                },
                                {
                                    "type": "Frame",
                                    "width": "80vw",
                                    "height": "65vh",
                                    "items": [
                                        {
                                            "type": "Video",
                                            "id": "VideoPlayer",
                                            "width": "79vw",
                                            "height": "64vh",
                                            "audioTrack": "foreground",
                                            "autoplay": true,
                                            "source": "${payload.lastMessageData.messageContent.video.url}",
                                            "onPause": [
                                                {
                                                    "type": "SetState",
                                                    "componentId": "alexaPlayPauseToggleButton",
                                                    "state": "checked",
                                                    "value": true
                                                }
                                            ],
                                            "onPlay": [
                                                {
                                                    "type": "SetState",
                                                    "componentId": "alexaPlayPauseToggleButton",
                                                    "state": "checked",
                                                    "value": false
                                                }
                                            ]
                                        }
                                    ],
                                    "backgroundColor": "#040b1b",
                                    "borderColor": "#A0A0A0",
                                    "borderWidth": "2",
                                    "left": "50"
                                },
                                {
                                    "type": "Container",
                                    "width": "10vw",
                                    "height": "20vh",
                                    "alignItems": "center",
                                    "item": [
                                        {
                                            "primaryControlSize": 70,
                                            "secondaryControlSize": 0,
                                            "mediaComponentId": "VideoPlayer",
                                            "type": "AlexaTransportControls"
                                        }
                                    ],
                                    "alignSelf": "center",
                                    "left": "550",
                                    "top": "-325"
                                }
                            ],
                            "grow": 1
                        }
                    ]
                },
                {
                    "type": "Container",
                    "when": "${@viewportProfile == @tvLandscapeXLarge}",
                    "height": "100vh",
                    "items": [
                        {
                            "type": "Image",
                            "width": "100vw",
                            "height": "100vh",
                            "source": "${payload.lastMessageData.backgroundImage.sources[0].url}",
                            "scale": "best-fill",
                            "overlayColor": "rgba(black,0.8)",
                            "position": "absolute"
                        },
                        {
                            "type": "AlexaHeader",
                            "headerAttributionImage": "${payload.lastMessageData.logoUrl}"
                        },
                        {
                            "type": "Container",
                            "items": [
                                {
                                    "type": "Frame",
                                    "width": "55vw",
                                    "height": "10vh",
                                    "items": [
                                        {
                                            "type": "Text",
                                            "width": "55vw",
                                            "height": "10vh",
                                            "paddingLeft": "10",
                                            "paddingTop": "10",
                                            "textAlign": "left",
                                            "color": "#1d74f5",
                                            "fontFamily": "roboto",
                                            "fontSize": "23",
                                            "text": "From ${payload.lastMessageData.messageContent.username.text},",
                                            "fontWeight": "bold"
                                        }
                                    ],
                                    "borderColor": "#A0A0A0",
                                    "borderWidth": "2",
                                    "left": "50"
                                },
                                {
                                    "type": "Frame",
                                    "width": "80vw",
                                    "height": "65vh",
                                    "items": [
                                        {
                                            "type": "Video",
                                            "id": "VideoPlayer",
                                            "width": "79vw",
                                            "height": "64vh",
                                            "audioTrack": "foreground",
                                            "autoplay": true,
                                            "source": "${payload.lastMessageData.messageContent.video.url}",
                                            "onPause": [
                                                {
                                                    "type": "SetState",
                                                    "componentId": "alexaPlayPauseToggleButton",
                                                    "state": "checked",
                                                    "value": true
                                                }
                                            ],
                                            "onPlay": [
                                                {
                                                    "type": "SetState",
                                                    "componentId": "alexaPlayPauseToggleButton",
                                                    "state": "checked",
                                                    "value": false
                                                }
                                            ]
                                        }
                                    ],
                                    "backgroundColor": "#040b1b",
                                    "borderColor": "#A0A0A0",
                                    "borderWidth": "2",
                                    "left": "50"
                                },
                                {
                                    "type": "Container",
                                    "width": "10vw",
                                    "height": "20vh",
                                    "alignItems": "center",
                                    "item": [
                                        {
                                            "primaryControlSize": 55,
                                            "secondaryControlSize": 0,
                                            "mediaComponentId": "VideoPlayer",
                                            "type": "AlexaTransportControls"
                                        }
                                    ],
                                    "alignSelf": "center",
                                    "left": "400",
                                    "top": "-225"
                                }
                            ],
                            "grow": 1
                        }
                    ]
                }
            ]
        }
    },

    // LAST MESSAGE NOT SUPPORTED FILETYPE

    "lastMessageNotSupported": {
        "type": "APL",
        "version": "1.1",
        "theme": "dark",
        "import": [
            {
                "name": "alexa-layouts",
                "version": "1.0.0"
            }
        ],
        "settings": {
            "idleTimeout": 120000
        },
        "resources": [
            {
                "description": "Common margins and padding",
                "dimensions": {
                    "marginTop": 40,
                    "marginLeft": 60,
                    "marginRight": 60,
                    "marginBottom": 40
                }
            }
        ],
        "graphics": {
            "parameterizedCircle": {
                "type": "AVG",
                "version": "1.0",
                "height": 100,
                "width": 100,
                "items": {
                    "type": "path",
                    "fill": "red",
                    "stroke": "blue",
                    "strokeWidth": 4,
                    "pathData": "M 50 0 L 100 50 L 50 100 L 0 50 z"
                }
            }
        },
        "layouts": {},
        "mainTemplate": {
            "parameters": [
                "payload"
            ],
            "items": [
                {
                    "type": "Container",
                    "when": "${@viewportProfile == @hubRoundSmall}",
                    "height": "100vh",
                    "items": [
                        {
                            "type": "Image",
                            "width": "100vw",
                            "height": "100vh",
                            "paddingLeft": "600",
                            "source": "${payload.LastMessageNotSupportedData.backgroundImage.sources[0].url}",
                            "scale": "best-fill",
                            "align": "right",
                            "overlayColor": "rgba(black,0.5)",
                            "position": "absolute"
                        },
                        {
                            "type": "AlexaHeader",
                            "headerAttributionImage": "${payload.LastMessageNotSupportedData.logoUrl}"
                        },
                        {
                            "type": "Container",
                            "grow": 1,
                            "items": [
                                {
                                    "type": "Text",
                                    "paddingLeft": "@marginLeft",
                                    "paddingRight": "@marginRight",
                                    "textAlign": "center",
                                    "color": "#DC143C",
                                    "fontFamily": "avenir next condensed",
                                    "fontSize": "30",
                                    "text": "${payload.LastMessageNotSupportedData.textContent.primaryText.text}",
                                    "fontWeight": "bold"
                                },
                                {
                                    "type": "Text",
                                    "paddingLeft": "@marginLeft",
                                    "height": "70vh",
                                    "fontSize": "26",
                                    "paddingTop": "50",
                                    "paddingRight": "@marginRight",
                                    "textAlign": "center",
                                    "color": "#FFFFFF",
                                    "fontSize": "24",
                                    "text": "${payload.LastMessageNotSupportedData.textContent.secondaryText.text}"
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "Container",
                    "when": "${@viewportProfile == @hubLandscapeSmall}",
                    "height": "100vh",
                    "items": [
                        {
                            "type": "Image",
                            "width": "100vw",
                            "height": "100vh",
                            "source": "${payload.LastMessageNotSupportedData.backgroundImage.sources[0].url}",
                            "scale": "best-fill",
                            "overlayColor": "rgba(black,0.5)",
                            "position": "absolute"
                        },
                        {
                            "type": "AlexaHeader",
                            "headerAttributionImage": "${payload.LastMessageNotSupportedData.logoUrl}"
                        },
                        {
                            "type": "Container",
                            "grow": 1,
                            "items": [
                                {
                                    "type": "Text",
                                    "paddingLeft": "@marginLeft",
                                    "paddingRight": "@marginRight",
                                    "paddingBottom": "30",
                                    "textAlign": "left",
                                    "color": "#DC143C",
                                    "fontFamily": "avenir next condensed",
                                    "text": "${payload.LastMessageNotSupportedData.textContent.primaryText.text}",
                                    "fontWeight": "bold"
                                },
                                {
                                    "type": "Text",
                                    "paddingLeft": "@marginLeft",
                                    "paddingRight": "@marginRight",
                                    "paddingBottom": "300",
                                    "textAlign": "left",
                                    "color": "#FFFFFF",
                                    "fontSize": "30",
                                    "text": "${payload.LastMessageNotSupportedData.textContent.secondaryText.text}"
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "Container",
                    "when": "${@viewportProfile == @hubLandscapeMedium}",
                    "height": "100vh",
                    "items": [
                        {
                            "type": "Image",
                            "width": "100vw",
                            "height": "100vh",
                            "source": "${payload.LastMessageNotSupportedData.backgroundImage.sources[0].url}",
                            "scale": "best-fill",
                            "overlayColor": "rgba(black,0.5)",
                            "position": "absolute"
                        },
                        {
                            "type": "AlexaHeader",
                            "headerAttributionImage": "${payload.LastMessageNotSupportedData.logoUrl}"
                        },
                        {
                            "type": "Container",
                            "grow": 1,
                            "items": [
                                {
                                    "type": "Text",
                                    "style": "textStyleBody",
                                    "paddingLeft": "@marginLeft",
                                    "paddingRight": "@marginRight",
                                    "paddingBottom": "30",
                                    "textAlign": "left",
                                    "color": "#DC143C",
                                    "fontFamily": "avenir next condensed",
                                    "fontSize": "40",
                                    "text": "${payload.LastMessageNotSupportedData.textContent.primaryText.text}",
                                    "fontWeight": "bold"
                                },
                                {
                                    "type": "Text",
                                    "paddingLeft": "@marginLeft",
                                    "paddingRight": "@marginRight",
                                    "paddingBottom": "350",
                                    "textAlign": "left",
                                    "color": "#FFFFFF",
                                    "fontSize": "30",
                                    "text": "${payload.LastMessageNotSupportedData.textContent.secondaryText.text}"
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "Container",
                    "when": "${@viewportProfile == @hubLandscapeLarge}",
                    "height": "100vh",
                    "items": [
                        {
                            "type": "Image",
                            "width": "100vw",
                            "height": "100vh",
                            "source": "${payload.LastMessageNotSupportedData.backgroundImage.sources[0].url}",
                            "scale": "best-fill",
                            "overlayColor": "rgba(black,0.5)",
                            "position": "absolute"
                        },
                        {
                            "type": "AlexaHeader",
                            "headerAttributionImage": "${payload.LastMessageNotSupportedData.logoUrl}"
                        },
                        {
                            "type": "Container",
                            "grow": 1,
                            "items": [
                                {
                                    "type": "Text",
                                    "paddingLeft": "@marginLeft",
                                    "paddingRight": "@marginRight",
                                    "paddingBottom": "30",
                                    "textAlign": "left",
                                    "color": "#DC143C",
                                    "fontFamily": "avenir next condensed",
                                    "fontSize": "50",
                                    "text": "${payload.LastMessageNotSupportedData.textContent.primaryText.text}",
                                    "fontWeight": "bold"
                                },
                                {
                                    "type": "Text",
                                    "paddingLeft": "@marginLeft",
                                    "paddingRight": "@marginRight",
                                    "paddingBottom": "550",
                                    "textAlign": "left",
                                    "color": "#FFFFFF",
                                    "fontSize": "40",
                                    "text": "${payload.LastMessageNotSupportedData.textContent.secondaryText.text}"
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "Container",
                    "when": "${@viewportProfile == @tvLandscapeXLarge}",
                    "height": "100vh",
                    "items": [
                        {
                            "type": "Image",
                            "width": "100vw",
                            "height": "100vh",
                            "source": "${payload.LastMessageNotSupportedData.backgroundImage.sources[0].url}",
                            "scale": "best-fill",
                            "overlayColor": "rgba(black,0.5)",
                            "position": "absolute"
                        },
                        {
                            "type": "AlexaHeader",
                            "headerAttributionImage": "${payload.LastMessageNotSupportedData.logoUrl}"
                        },
                        {
                            "type": "Container",
                            "grow": 1,
                            "items": [
                                {
                                    "type": "Text",
                                    "paddingLeft": "@marginLeft",
                                    "paddingRight": "@marginRight",
                                    "paddingBottom": "30",
                                    "textAlign": "left",
                                    "color": "#DC143C",
                                    "fontFamily": "avenir next condensed",
                                    "fontSize": "40",
                                    "text": "${payload.LastMessageNotSupportedData.textContent.primaryText.text}",
                                    "fontWeight": "bold"
                                },
                                {
                                    "type": "Text",
                                    "paddingLeft": "@marginLeft",
                                    "paddingRight": "@marginRight",
                                    "paddingBottom": "300",
                                    "textAlign": "left",
                                    "color": "#FFFFFF",
                                    "fontSize": "30",
                                    "text": "${payload.LastMessageNotSupportedData.textContent.secondaryText.text}"
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    },

    // ENTER NEXT LAYOUT BELOW


}
