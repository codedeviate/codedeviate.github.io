import os
import json

def read_config(file_path):
    with open(file_path, 'r') as file:
        return json.load(file)

def read_template(template_name):
    with open(f'templates/{template_name}.html', 'r') as file:
        return file.read()

def read_content(content_name):
    with open(f'content/{content_name}', 'r') as file:
        return file.read()

def write_output(file_path, content):
    with open(file_path, 'w') as file:
        file.write(content)

def generate_pages():
    pages_dir = 'pages'
    output_dir = '..'

    for config_file in os.listdir(pages_dir):
        if config_file.endswith('.json'):
            config_path = os.path.join(pages_dir, config_file)
            config = read_config(config_path)

            template_name = config.get("template")
            template_content = read_template(template_name)

            template_content = template_content.replace(f'[[TITLE]]', config.get("title"))

            for placeholder, content_name in config['content'].items():
                content = read_content(content_name)
                template_content = template_content.replace(f'[[{placeholder}]]', content)

            output_path = os.path.join(output_dir, config['output'])
            print ("Writing " + output_path)
            write_output(output_path, template_content)

if __name__ == '__main__':
    generate_pages()