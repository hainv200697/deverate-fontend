import { Component, Output, EventEmitter, OnInit, AfterViewInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { QuestionApiService } from '../../../services/question-api.service';
import { CatalogueApiService } from '../../../services/catalogue-api.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { element } from 'protractor';
import Stepper from 'bs-stepper';
import { AnswerApiService } from '../../../services/answer-api.service';
import { ViewEncapsulation } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
declare var $: any;
@Component({
    selector: 'app-insert-question',
    templateUrl: './insert-question.component.html',
    styleUrls: ['./insert-question.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class InsertQuestionComponent implements OnInit, AfterViewInit {
    constructor(
        private translate: TranslateService,
        public router: Router,
        private questionService: QuestionApiService,
        private catelogueService: CatalogueApiService,
        private modalService: NgbModal,
        private formBuilder: FormBuilder,
        private answerService: AnswerApiService,
        private toastr: ToastrService
    ) {
    }
    private stepper: Stepper;
    selectedAll: any;
    updateStatus=[];
    checkDup = 0;
    ansForm: FormGroup;
    answersForm: FormGroup;
    form: any;
    count = 1;
    answerForm: FormGroup;
    submitted = false;
    index = 1;
    // Question
    question = {};
    answer = {};
    // inscrease Question
    insQuestion = {};
    insAnswer = [];
    // update Question
    updQuestion = {};
    updAnswer = [];
    anwserDel = [];
    // Catalogue
    catalogue = [];
    allQuestions = [];

    next() {

        this.insAnswer = this.answerForm.controls['answers'].value;
        console.log(this.insQuestion);
        let check = true;
        const catalog = this.insAnswer['CatalogueId'];
        if (catalog === "" || catalog === undefined || catalog === null) {
            this.toastr.error('Message', 'Cataloguecan not be blank!');
            $('#ins_question_cate_id').css('border-color', 'red');
            $('#ins_question_cate_id').focus();
            return;
        }
        const question = this.insAnswer['question'];
        if (question === "" || question === undefined || question === null) {
            this.toastr.error('Message', 'Question can not be blank!');
            $('#ins_question_question').css('border-color', 'red');
            $('#ins_question_question').focus();
            return;
        }

        if (question.length < 10) {
            this.toastr.error('Message', 'question must be more than 10 characters!');
            $('#ins_question_question').css('border-color', 'red');
            $('#ins_question_question').focus();
            return;
        }

        if (question.length > 300) {
            this.toastr.error('Message', 'question must be less than 300 characters!');
            $('#ins_question_question').css('border-color', 'red');
            $('#ins_question_question').focus();
            return;
        }


        let i = -1;
        this.insAnswer.forEach(element => {
            i++;
            if (check == true) {
                var ans = element['Answer'];
                if (ans === "" || ans.length < 5) {
                    this.toastr.error('Message', 'Answer must be more than 5 characters!');
                    check = false;
                    $('.ans-' + i).css('border-color', 'red');
                    $('.ans-' + i).focus();
                    return;
                }
                const mark: number = element['mark'];
                if (mark === null || mark === undefined) {
                    this.toastr.error('Message', 'Mark can not be blank!');
                    check = false;
                    $('.mark-' + i).css('border-color', 'red');
                    $('.mark-' + i).focus();
                    return;
                }
                if (6 < mark || mark < 1) {
                    this.toastr.error('Message', 'Mark can not be bigger than 6!');
                    check = false;
                    $('.mark-' + i).css('border-color', 'red');
                    $('.mark-' + i).focus();
                    return;
                }
                if (mark < 1) {
                    this.toastr.error('Message', 'Mark can not be smaller than 1!');
                    check = false;
                    $('.mark-' + i).css('border-color', 'red');
                    $('.mark-' + i).focus();
                    return;
                }
            }
            else {
                return;
            }
        });
        if (check == true) {
            this.stepper.next();
            this.index++;
        }


    }

    back() {
        this.stepper.previous();
    }

    onSubmit() {
        return false;
    }
    ngOnInit() {

        this.mainForm();
        for (let i = 0; i <= 1; i++) {
            this.count++;
            (<FormArray>this.answerForm.controls['answers']).push(this.addAnswerForm());
        }
        this.question['question'] = '';
        this.question['cate_id'] = '';
        this.getAllQuestion();
        this.getAllCatalogue();

    }

    // dynamic form

    mainForm() {
        this.answerForm = this.formBuilder.group({
            answers: this.formBuilder.array([
                this.addAnswerForm()
            ])
        });

    }

    onAddAnswers() {

        this.count++;
        console.log(this.count);
        if (this.count < 6) {
            (<FormArray>this.answerForm.controls['answers']).push(this.addAnswerForm());
        }
        else {
            this.toastr.error('Message', 'Can not create more than 5 answers!');
        }

    }

    addAnswerForm(): FormGroup {
        this.answersForm = this.formBuilder.group({
            Answer: ['', Validators.required],
            mark: ['', Validators.required]
        });
        return this.answersForm;
    }
    removeUnit(i: number) {
        this.count--;
        const control = <FormArray>this.answerForm.controls['answers'];
        control.removeAt(i);
    }

    updateAnswerForm(): FormGroup {
        return this.formBuilder.group({
            Answer: ['', Validators.required],
            mark: ['', Validators.required],
            AnswerId: ['', Validators.required],
        });
    }

    onAddUpdateAnswers() {
        (<FormArray>this.answerForm.controls['answers']).push(this.updateAnswerForm());
    }

    //Endynamic form 

    //Open modal 
    open(content) {
        this.index = 1;
        this.modalService.open(content, { size: 'lg', windowClass: "myCustomModalClass" });
        var a = document.querySelector('#stepper1');
        this.stepper = new Stepper(a, {
            linear: false,
            animation: true
        });
    }

    closeModal() {
        this.modalService.dismissAll();
        this.getAllQuestion();
    }

    openUpdate(item, update) {
        this.checkDup = 0;
        this.answerForm = this.formBuilder.group({
            answers: this.formBuilder.array([
            ])
        });
        this.index = 1;
        this.getAnswerByQuestionId(item['QuestionId']);
        this.updQuestion['QuestionId'] = item['QuestionId'];
        this.updQuestion['CatalogueId'] = item['CatalogueId'];
        this.updQuestion['Question'] = item['Question'];
        this.modalService.open(update, { size: 'lg', ariaLabelledBy: 'modal-basic-title' });
        var a = document.querySelector('#stepper1');
        this.stepper = new Stepper(a, {
            linear: false,
            animation: true
        });
    }

    closeUpdateModal() {
        this.index = 0;
        this.modalService.dismissAll();
        this.getAllQuestion();
    }

    // next(key) {

    //     if (this.index == 0) {
    //         console.log(key);

    //         if (key === 'upd' && this.checkDup === 0) {
    //             this.count = 0;
    //             this.updAnswer = this.updQuestion['answer'];
    //             this.updAnswer.forEach(item => {
    //                 this.ansForm = this.updateAnswerForm();
    //                 this.ansForm.setValue({
    //                     "Answer": item['Answer'],
    //                     "mark": item['mark'],
    //                     "AnswerId": item['AnswerId']
    //                 });
    //                 (<FormArray>this.answerForm.controls['answers']).push(this.ansForm);
    //                 this.count++;
    //             });
    //             this.checkDup = 1;
    //         }

    //     }
    //     else if (this.index == 1) {

    //         $('.next').css('display', 'none');
    //         if (key === 'ins') {
    //             this.insAnswer = this.answerForm.controls['answers'].value;
    //         }
    //         else {
    //             this.updAnswer = this.answerForm.controls['answers'].value;
    //         }
    //         this.getCatalogById(this.insQuestion['cate_id']);
    //     }
    //     else {
    //         $('.next').css('display', 'block');
    //         $('.back').css('display', 'block');
    //     }
    //     this.index += 1;
    // }

    // back() {
    //     if (this.index == 0) {
    //         $('.back').css('display', 'none');
    //     }
    //     else {
    //         $('.back').css('display', 'block');
    //         $('.next').css('display', 'block');

    //     }
    //     this.index -= 1;
    // }

    // checkbox
    selectAll() {
        this.updateStatus = [];
        for (var i = 0; i < this.allQuestions.length; i++) {
            this.allQuestions[i].selected = this.selectedAll;
            this.updateStatus.push(this.allQuestions[i])
        }
    }

    checkIfAllSelected() {
        this.updateStatus = [];
        this.selectedAll = this.allQuestions.every(function (item: any) {
            return item.selected == true;

        })
        for (var i = 0; i < this.allQuestions.length; i++) {
            if (this.allQuestions[i].selected == true) {
                this.updateStatus.push(this.allQuestions[i])
            }
        }

    }

    clickButtonChangeStatus(status: boolean){
        Swal.fire({
          title: 'Are you sure?',
          text: 'This catalogue will be delete!',
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, delete it!',
          cancelButtonText: 'No, keep it'
        }).then((result) => {
          if (result.value) {
            for(var i =0; i< this.updateStatus.length; i++){
              this.updateStatus[i].IsActive = status;
            }
            this.questionService.removeQuestion(this.updateStatus).subscribe(
                (results) => {
                    console.log(results);
                }
            );
            this.getAllQuestion();
            
            Swal.fire(
              'Deleted',
              '',
              'success'
            )
            
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            this.updateStatus = [];
            Swal.fire(
              'Cancelled',
              '',
              'error'
            )
          }
        })
    }


    // end Modal
    insertQuestionSubmit() {
        this.addQuestion();
        this.closeModal();
        this.getAllQuestion();
    }

    clickButtonRefresh(refesh) {
        refesh.classList.add('spin-animation');
        setTimeout(function () {
            refesh.classList.remove('spin-animation');
        }, 500)
        this.getAllQuestion();
    }

    addQuestion() {
        this.insQuestion['IsActive'] = true;
        this.insQuestion['create_by'] = 1;
        console.log(this.insAnswer);
        this.questionService.insertQuestion(this.insQuestion).subscribe(
            (results) => {
                const QuestionId = results['data']['data'];
                if (QuestionId != null) {
                    this.insAnswer.forEach(element => {
                        element['QuestionId'] = QuestionId;
                        this.answerService.insertAnswer(element).subscribe(
                            (results) => {

                                console.log(results);
                            }
                        );
                    });
                }
            }
        );
        this.getAllQuestion();
    }

    updateQuestionSubmit() {
        this.updateQuestion();
        const disable = this.disableAnswer();
        if (disable === true) {
            console.log(disable);
            this.updateAnser();
        }
        this.getAllQuestion();
        this.closeUpdateModal();

    }

    updateQuestion() {
        this.updQuestion['IsActive'] = true;
        this.updQuestion['create_by'] = 1;
        this.updQuestion['CatalogueId'] = parseInt(this.updQuestion['CatalogueId']);
        console.log(this.updQuestion);
        this.questionService.updateQuestion(this.updQuestion).subscribe(
            (results) => {
            }
        );
    }

    updateAnser() {
        console.log(this.updAnswer);
        this.updAnswer.forEach(element => {
            element['QuestionId'] = this.updQuestion['QuestionId'];
            console.log(element);
            this.answerService.updateAnswer(element).subscribe(
                (results) => {
                    console.log(results);
                }
            );
        });
        this.getAllQuestion();
    }

    disableAnswer() {
        console.log(this.updQuestion['answer']);
        this.updQuestion['answer'].forEach(element => {
            this.anwserDel.push(element['AnswerId']);
        });
        // this.answerService.disableAnswer(element['AnswerId']).subscribe(
        //     (results) => {
        //         console.log(results);
        //     }
        // );
        console.log(this.anwserDel);
        return true;
    }

    // Get all question
    getAllQuestion() {
        this.questionService.getAllQuestion().subscribe(
            (data) => {

                this.allQuestions = data['data']['data'];
                this.allQuestions.forEach(element => {
                    element.catalogue_name = element.catalogue.Name;
                });
            }
        );
    }

    // Get all catalogue
    getAllCatalogue() {
        this.catelogueService.getAllCatalogue().subscribe(
            (data) => {

                this.catalogue = data['data']['data'];
            }
        );
    }

    getAnswerByQuestionId(id: Number) {
        let questId = id + '';
        this.answerService.getAllAnswerByQuestioId(questId).subscribe(
            (data) => {

                this.updQuestion['answer'] = data['data']['data'];
            }
        );
    }

    getCatalogById(id: Number) {

        this.catalogue.forEach(element => {
            if (element.CatalogueId == id) {
                this.insQuestion['catalogue_name'] = element.Name;
            }
        });
    }

    // reset
    reset() {
        this.count = 1;
        this.insQuestion = {};
        this.insAnswer = [];
    }


    ngAfterViewInit(){
        $('input').focusout(function() {
            $(this).css("border-color","#ced4da");;
          });
        
    }
}