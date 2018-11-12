const Vue = require("vue").default;
const upperFirst = require("lodash").upperFirst;
const camelCase = require("lodash").camelCase;

function registerStories(req, fileName, sbInstance, plugins, extensions) {
  const {
    action,
    withNotes,
    text,
    boolean,
    number,
    color,
    object,
    array,
    select,
    date,
    withKnobs
  } = plugins;
  const componentConfig = req(fileName);
  const componentName = componentConfig.default.name || upperFirst(
    camelCase(fileName.replace(/^\.\/[\W_]*?/, "").replace(/\.\w+$/, ""))
  );
  const group = fileName
    .replace(/^\.\/[\W_]*?/, "")
    .replace(/\.\w+$/, "")
    .replace(/components\//, "")

  const stories =
    componentConfig.__stories || componentConfig.default.__stories;
  if (!stories) return;
  stories.forEach(story => {
    let storiesOf = sbInstance(story.group || group, module);
    let addFunc;
    let baseFunc = () => {
      let data = story.knobs ? eval(`(${story.knobs})`) : {};
      return {
        ...extensions,
        data() {
          return data;
        },
        template: story.template.replace('@component', componentName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()),
        methods: eval(`(${story.methods})`)
      };
    };

    story.notes
      ? (addFunc = withNotes(story.notes)(baseFunc))
      : (addFunc = baseFunc);

    story.knobs ? storiesOf.addDecorator(withKnobs) : false;

    storiesOf.add(story.name, addFunc);

    Vue.component(componentName, componentConfig.default || componentConfig);
  });
}

module.exports = registerStories;
