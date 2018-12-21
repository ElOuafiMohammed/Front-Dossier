pipeline {
    agent any
    tools {
        jdk 'jdk8u131'
    }
    stages {
    
        //stage ('Initialize') {
        //    steps {
          //      script {
            //        sh "env"
              //      def node = tool name: 'node-js-9.8.0', type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation'
                //    env.PATH = "${node}/bin:${env.PATH}"
            //    }
            //}
        //}

    
        stage ('Build Analyse') {
            steps {
                script { 
                        if (env.BRANCH_NAME == 'develop') {
                        env.BRANCH_NAME_LC = "${BRANCH_NAME.toLowerCase()}"
                        sh '''
                                #!/bin/bash
                                docker build . --file DockerfileAnalyse --tag=sonar-${BRANCH_NAME_LC}-dossier-frontend
                            '''
                    }
                }
            }
        }
        
        stage ('Test') {
            steps {
                script { 
                    if (env.BRANCH_NAME == 'develop') {
                        sh '''
                            #!/bin/bash
                            echo "node version: $(node -v)"
                            echo "npm version: $(npm -v)"
                            echo "ng : $(which ng)"
                            echo "Running Tests"
                            # ng test --code-coverage # TODO
                            echo "Finding ng..."
                            find . -name ng
                            echo "End Tests"
                        '''
                    }
                }
				
        }
            

        // post {
        // success {
        //   junit '**/build/test-results/**/TEST-*.xml' 
        //  }
        //}
        
        }
    	
        stage ('Package') {
                steps {
                script { 
                    if (env.BRANCH_NAME == 'release') {
                        sh '''
                             #!/bin/bash
                             docker build . --tag=qualification-siga.akka.eu:87/siga/dossier-frontend
                             docker push qualification-siga.akka.eu:87/siga/dossier-frontend
                           '''
                    } else {
                        env.BRANCH_NAME_LC = "${BRANCH_NAME.toLowerCase()}"
                        sh '''
                             #!/bin/bash
                             docker build . --tag=qualification-siga.akka.eu:87/siga/dummy-${BRANCH_NAME_LC}-dossier-frontend
                           '''
                    }
                }
            }
        }
           stage ('Test e2e (optionnel, empêche pas le fonctionnement du package)') {
            steps {
                script { 
                    if (env.BRANCH_NAME == 'develop') {
                        /*
                        sh '''
                             #!/bin/bash
                            docker exec e2e_protractor_1 protractor protractorDos.conf.js --params.adresse=http://integration.siga.akka.eu:84/accueil
                            '''
                            */
                        }
                    }
                }
            }
   }
    post {
         always {
             script { 
                    if (env.BRANCH_NAME == 'develop') {
                        /*
                                sh '''
                                #!/bin/bash
                                mkdir test-output
                                docker cp e2e_protractor_1:frontend/test-output/ng-e2eDos-results.xml ./test-output/
                                '''
                                */
                                // junit '**/test-output/*e2eDos-results.xml'
                        }
                    }
         }
    failure {
                emailext(body: '${DEFAULT_CONTENT}',
                         mimeType: 'text/html',
                         replyTo: '$DEFAULT_REPLYTO', subject: '[SIGA-Jenkins] : ${DEFAULT_SUBJECT}',
                         to: emailextrecipients([[$class: 'CulpritsRecipientProvider'],
                                                 [$class: 'RequesterRecipientProvider']]))
             } 
         }
}
