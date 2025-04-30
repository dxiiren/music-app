import upperFirst from 'lodash'
import camelCase from 'lodash'

export default{
    install(app){
        const baseComponents = import.meta.glob('../components/Base/*.vue', { eager: true })

        Object.entries(baseComponents).forEach(([path, module]) => {
            const componentName = upperFirst(
                camelCase(
                    path
                        .split('/')
                        .pop()
                        .replace(/\.\w+$/, '')
                )
            );

            app.component(`Base${componentName}`, module.default);
        })
    }
}