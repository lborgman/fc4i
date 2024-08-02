
//// Alternatives:
// https://azaslavsky.github.io/domJSON/

////////////////////////////////////////////////////////////////////
// https://code.nkslearning.com/blogs/convert-a-dom-element-to-json-and-from-json-to-a-dom-element_657b39220240466b93a0
export function getJSONFromDOMElement(element) {
    if (!element || typeof element !== 'object') {
        return null;
    }
    const json = {};
    let a = element.nodeType;
    json.nodeType = a;
    if (a === 3) {
        let e = element.textContent;
        if (e && e.trim().length > 0) json.text = e;
        else return null;
    } else if (a === 1) {
        json.nodeName = element.nodeName;
        let b = element.attributes;
        if (b && b.length > 0) {
            let attributes = {};
            for (let i = 0; i < b.length; i++) {
                const attribute = b[i];
                attributes[attribute.name] = attribute.value;
            }
            json.attributes = attributes;
        }
        if (json.nodeName === "svg") {
            json.innerHTML = element.innerHTML;
        } else {
            let c = element.childNodes;
            if (c && c.length > 0) {
                let childNodes = [];
                c.forEach((child) => {
                    let r = getJSONFromDOMElement(child);
                    if (r) childNodes.push(r);
                });
                json.childNodes = childNodes;
            }
        }
    } else return null;
    return json;
}
export function createElementFromJSON(json) {
    if (!json || typeof json !== 'object') {
        return null;
    }
    if (json.nodeType === 3) {
        return document.createTextNode(json.text || '');
    } else if (json.nodeType === 1) {
        var newNode;
        if (json.nodeName === 'svg') {
            newNode = document.createElementNS(json.attributes.xmlns || 'http://www.w3.org/2000/svg', json.nodeName);
            if (json.attributes) {
                for (const attributeName in json.attributes) {
                    if (json.attributes.hasOwnProperty(attributeName)) {
                        newNode.setAttribute(attributeName, json.attributes[attributeName]);
                    }
                }
            }
            newNode.innerHTML = json.innerHTML;
        } else {
            newNode = document.createElement(json.nodeName);
            if (json.attributes) {
                for (const attributeName in json.attributes) {
                    if (json.attributes.hasOwnProperty(attributeName)) {
                        newNode.setAttribute(attributeName, json.attributes[attributeName]);
                    }
                }
            }
            if (json.childNodes && json.childNodes.length > 0) {
                json.childNodes.forEach((childJSON) => {
                    const childNode = createElementFromJSON(childJSON);
                    if (childNode) {
                        newNode.appendChild(childNode);
                    }
                });
            }
        }

        return newNode;
    } else {
        return null;
    }
}


////////////////////////////////////////////////////////////////////
// https://craft-code.dev/essays/connection/dom-to-json-and-back
export default function domToJson(dom) {
    const { attributes, childNodes, tagName } = dom
    const eventList = dom.getAttribute("data-events")
    const events = eventList?.split(",").reduce((out, evt) => {
      const [key, value] = evt.split(":")
      if (key) {
        out[key] = value
      }
      return out
    }, {})
    const attrs = Object.values(attributes)
      .map((v) => v.localName)
      .filter((name) => name !== "data-events")
    return {
      tagName,
      attributes: attrs.reduce((out, attr) => {
        out[attr] = dom.getAttribute(attr)
        return out
      }, {}),
      events,
      children: Array.from(childNodes).map((_, idx) => {
        const child = childNodes[idx]
        return child.nodeType === Node.TEXT_NODE ? child.nodeValue : domToJson(child)
      }),
    }
  }
export default async function jsonToDom(js) {
    const { attributes, children, events, tagName } = js
    const elem = document.createElement(tagName)
    for (const attr in attributes) {
        elem.setAttribute(attr, attributes[attr])
    }
    if (Array.isArray(children)) {
        for (const child of children) {
            typeof child === "object" ? elem.appendChild(await jsonToDom(child)) : elem.appendChild(document.createTextNode(child))
        }
    }
    if (events) {
        for (const key in events) {
            if (!events[key]) {
                break
            }
            const handler = typeof events[key] === "function" ? events[key] : (await import(`./${events[key]}.js`)).default
            handler && elem.addEventListener(key, handler)
        }
        setDataEvents(elem, js.events)
    }
    return elem
}
function setDataEvents(elem, obj = {}) {
    const eventString = Object.keys(obj)
        .reduce((out, key) => {
            if (typeof obj[key] === "string") {
                out.push(`${key}:${obj[key]}`)
            }
            return out
        }, [])
        .join(",")
    if (eventString) {
        elem.setAttribute("data-events", eventString)
    }
}