export class Splitter {
    constructor(splitterDiv) {
        this.splitterDiv = splitterDiv;
        this.parentContainer = this.splitterDiv.parentElement;
        this.prevPanel = this.splitterDiv.previousElementSibling;
        this.nextPanel = this.splitterDiv.nextElementSibling;

        this.splitterDiv.style.backgroundColor = window.getComputedStyle(this.nextPanel, null).getPropertyValue('background-color');

        this.dragging = false;

        this.splitterDiv.addEventListener('mousedown', (e) => {
            this.dragging = true;
        });

        window.addEventListener('mouseup', (e) => {
            this.dragging = false;
        });

        document.addEventListener('mouseleave', (e) => {
            this.dragging = false;
        });

        window.addEventListener('mousemove', (e) => {
            if (this.dragging !== true) {
                return;
            }

            this.resize(e);

            if (typeof this.onResize === 'function') {
                this.onResize();
            }
        });

        this.resize();
    }

    resize(e) {
        if (this.splitterDiv.classList.contains('left-splitter')) {
            this.moveLeft(e);
        }
    }

    moveLeft(e) {
        const movementX = e == null ? 0 : e.movementX;
        const parentWidth = this.parentContainer.clientWidth;
        const newNextWidth = this.nextPanel.clientWidth - movementX;
        this.nextPanel.style.width = newNextWidth;

        const newPrevWidth = parentWidth - newNextWidth - this.splitterDiv.clientWidth;
        this.prevPanel.style.width = newPrevWidth;
    }
}