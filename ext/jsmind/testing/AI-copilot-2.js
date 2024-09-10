/*
I understand your frustration. Let's try a different approach to ensure we get the final size of the element accurately. We can use a combination of `MutationObserver` and `ResizeObserver` to ensure the element is fully rendered and its size has stabilized.

Here's a more robust solution:

```javascript
*/
function getElementSizeAfterRender(selector, callback) {
    const element = document.querySelector(selector);

    if (!element) {
        console.error('Element not found');
        return;
    }

    let resizeObserver;
    const mutationObserver = new MutationObserver(() => {
        if (resizeObserver) {
            resizeObserver.disconnect();
        }

        resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const rect = entry.contentRect;
                if (rect.width && rect.height) {
                    callback(rect);
                    resizeObserver.disconnect(); // Stop observing once we get the final size
                    mutationObserver.disconnect(); // Stop observing mutations
                }
            }
        });

        resizeObserver.observe(element);
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    // Initial check in case the element is already rendered
    requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        if (rect.width && rect.height) {
            callback(rect);
            mutationObserver.disconnect();
        }
    });
}

// Usage example
const newElement = document.createElement('div');
newElement.id = 'myElement';
newElement.style.width = '100px';
newElement.style.height = '50px';
document.body.appendChild(newElement);

getElementSizeAfterRender('#myElement', (rect) => {
    console.log(`Width: ${rect.width}, Height: ${rect.height}`);
});
/*
```

In this version:
1. **MutationObserver**: Observes changes in the document body to detect when the new element is added.
2. **ResizeObserver**: Observes the element for any size changes.
3. **Disconnect**: Both observers stop observing once the final size is obtained.

This should ensure that you get the final size of the element accurately. Please give this a try and let me know if it works for you! If it still doesn't work, we can explore other options together.

*/