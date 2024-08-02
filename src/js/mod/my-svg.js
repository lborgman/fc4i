const nsSvg = 'http://www.w3.org/2000/svg';

export function mkEltSvg(type, attrib, inner) {


    var elt = document.createElementNS(nsSvg, type);

    function addInner(inr) {
        if (inr instanceof Element) {
            elt.appendChild(inr);
        } else {
            // https://stackoverflow.com/questions/9281199/adding-text-to-svg-document-in-javascript
            // const txt = document.createTextNode(inr.toString());

            const newText = document.createElementNS(svgNS, "text");
            newText.setAttributeNS(null, "x", x);
            newText.setAttributeNS(null, "y", y);
            newText.setAttributeNS(null, "font-size", "100");

            const textNode = document.createTextNode(inr.toString());
            newText.appendChild(textNode);
            // document.getElementById("g").appendChild(newText);

            // elt.appendChild(txt);
            elt.appendChild(newText);
        }
    }
    if (inner) {
        if (inner.length && typeof inner != "string") {
            for (var i = 0; i < inner.length; i++)
                if (inner[i])
                    addInner(inner[i]);
        } else
            addInner(inner);
    }
    for (var x in attrib) {
        // elt.setAttribute(x, attrib[x]);
        elt.setAttributeNS(null, x, attrib[x]);
    }
    return elt;
}