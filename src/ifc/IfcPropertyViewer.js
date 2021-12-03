import { Tab } from "bootstrap";
import Splitter from "../Splitter";

let tabId = 0;

export default class IfcPropertyViewer {
    constructor(parent) {
        this.parent = parent;

        const splitterElement = document.getElementById('ifc-property-splitter');
        this.splitter = new Splitter(splitterElement);
        this.splitter.onResize = () => {
            this.parent.resize();
        }

        this.propertyPanel = document.getElementById('ifc-property-panel');
        this.propertyTabs = document.getElementById('ifc-property-tabs');
        this.propertyTabContents = document.getElementById('ifc-property-contents');
    }

    resize() {
        this.splitter.resize();
    }

    displayProps(props) {
        while (this.propertyTabs.firstChild) {
            this.propertyTabs.removeChild(this.propertyTabs.firstChild);
        }

        while (this.propertyTabContents.firstChild) {
            this.propertyTabContents.removeChild(this.propertyTabContents.firstChild);
        }

        const mainTab = this.createTab(props.constructor.name, this.createTable(props));
        mainTab.show();

        this.createPSetTabs(props);
    }

    createTable(propertyGroup) {
        const table = document.createElement('table');
        table.classList.add('ifc-property-table');

        for (let propertyName in propertyGroup) {
            const property = propertyGroup[propertyName];
            if (property == null || property.type !== 1) {
                continue;
            }

            const value = property.value;

            this.addTableRow(table, propertyName, value);
        }

        return table;
    }

    addTableRow(table, name, value) {
        const tableRow = document.createElement('tr');
            
        const nameCell = document.createElement('td');
        nameCell.classList.add('ifc-property-name');
        nameCell.innerHTML = name;
        
        const valueCell = document.createElement('td');
        valueCell.classList.add('ifc-property-value');
        valueCell.innerHTML = value;

        tableRow.appendChild(nameCell);
        tableRow.appendChild(valueCell);

        table.appendChild(tableRow);
    }

    createPSetTabs(props) {
        if(props == null || props.psets == null) {
            return;
        }

        for(let propertySet of props.psets) {
            this.createPSetTable(propertySet);
            this.createTab(propertySet.Name.value, this.createPSetTable(propertySet));
        }
    }

    createPSetTable(propertySet) {
        const table = document.createElement('table');
        table.classList.add('ifc-property-table');

        for(let property of propertySet.HasProperties) {
            this.addTableRow(table, property.Name.value, property.NominalValue.value)
        }

        return table;
    }

    createTab(title, content) {
        const tabButtonId = 'ifc-property-tab-' + tabId;
        const tabContentId = 'ifc-property-tab-content-' + tabId;
        tabId += 1;

        const tabTemplateString =
            `
            <li class="nav-item">
                <button class="nav-link" id="${tabButtonId}" data-bs-toggle="tab" 
                    data-bs-target="#${tabContentId}" type="button" role="tab" 
                    aria-controls="profile" aria-selected="false">
                    ${title}
                </button>
            </li>
            `;

        const tabTemplate = document.createElement('template');
        tabTemplate.innerHTML = tabTemplateString;
        const tab = tabTemplate.content.firstChild.nextSibling;
        this.propertyTabs.appendChild(tab);

        const contentTemplateString =
            `
            <div class="tab-pane" id="${tabContentId}" role="tabpanel" aria-labelledby="contact-tab">
            </div>
            `;

        const contentTemplate = document.createElement('template');
        contentTemplate.innerHTML = contentTemplateString;
        const contentDiv = contentTemplate.content.firstChild.nextSibling;

        contentDiv.appendChild(content);

        this.propertyTabContents.appendChild(contentDiv);

        const triggerEl = document.querySelector('#' + tabButtonId)
        return new Tab(triggerEl)
    }
}