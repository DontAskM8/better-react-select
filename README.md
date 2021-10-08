# better-react-select
react-select 5.0 + react virtualized

### Not fully optimized & the code is very dirty. Feel free to create PR

Install 
`npm i https://github.com/DontAskM8/better-react-select/tarball/main`

## Usage
Usage is pretty much like vanila react-select.
Pass props as `grouped` if you want the list to be grouped. 
Should work with both isMulti & single select
Grouped options should be 
```
  [
    {
      label: "Example group name",
      value: [
        {
          label: "Item 1",
          value: "id_item1"
        },
        {
          label: "Item 2",
          value: "id_item2"
        },.....
      ]
    },
    {
      label: "Example group name2",
      value: [
        {
          label: "Item 1",
          value: "id_item1"
        },
        {
          label: "Item 2",
          value: "id_item2"
        },.....
      ]
    },......
  ]
```

Non grouped example
```
  [
    {
      label: "Example item1",
      value: "id_item1"
    },
    {
      label: "Example item2",
      value: "id_item2"
    },......
   ]
```
