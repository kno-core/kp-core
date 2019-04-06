import {execSync} from "child_process";
import {writeFileSync, readFileSync} from "fs";

export class TypescriptCompiler {

    private cache;

    constructor() {
        this.cache = [];
    }

    public compile(fileName): Promise<string> {
        let self = this;

        return new Promise(function (resolve, reject) {
            if (self.cache[fileName]) {
                resolve(self.cache[fileName]);
                return;
            }
            try {
                execSync('rm -f -r tmp').toString();
                execSync('mkdir tmp && cd tmp').toString();
                writeFileSync('./tmp/tsconfig.json', `{
  "compilerOptions": {
	"module": "commonjs",
	"noImplicitAny": true,
	"lib": ["es6", "es2015", "dom"],
	"removeComments": true,
	"preserveConstEnums": true,
	"sourceMap": true,
	"skipLibCheck": true
  },
  "files": [
	".${fileName}"
  ]
}`);

                writeFileSync('./tmp/webpack.config.ts', `module.exports = {
	entry: {
		app: '.${fileName.replace(".ts", ".js")}'
	},
	output: {
		libraryTarget: "var",
		filename: 'webpack.js',
	},
	externals: { buffer: "root Buffer" },
	target: "web"
};
`);
                execSync('cd tmp && tsc --p tsconfig.json').toString();
                execSync('cd tmp && webpack').toString();
                //execSync('cd tmp && browserify ./dist/webpack.js -o ./dist/bin.js').toString();
                //execSync(`browserify -p tinyify ${fileName.replace(".ts", ".js")} -o ./tmp/bin.js`).toString();


                self.cache[fileName] = readFileSync('./tmp/dist/webpack.js', 'utf8');
                //execSync('rm -f -r tmp').toString();


                resolve(self.cache[fileName]);
            }catch(e){
                console.trace(e);
                reject(e);
            }
        });
    }
}